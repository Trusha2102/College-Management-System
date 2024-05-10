import { Request, Response } from 'express';
import { FeesMaster } from '../../entity/FeesMaster';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import AppDataSource from '../../data-source';
import { Student } from '../../entity/Student';
import { FeesGroup } from '../../entity/FeesGroup';
import { FeesPayment } from '../../entity/FeesPayment';
import { BankPayment } from '../../entity/BankPayment';
import { Discount } from '../../entity/Discount';
import * as ejs from 'ejs';
import * as pdf from 'html-pdf';
import path from 'path';
import fs from 'fs';
import { createActivityLog } from '../../utils/activityLog';

export const feesAllocation = async (req: Request, res: Response) => {
  try {
    const { fees_group_ids, student_ids } = req.body;

    if (
      !Array.isArray(fees_group_ids) ||
      !Array.isArray(student_ids) ||
      student_ids.length === 0
    ) {
      return sendError(res, 400, 'Invalid payload');
    }
    const queryRunner = AppDataSource.createQueryRunner();

    const errors: string[] = [];

    // Run the transaction
    await runTransaction(queryRunner, async () => {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const feesMasterRepository =
        queryRunner.manager.getRepository(FeesMaster);
      const feesGroupRepository = queryRunner.manager.getRepository(FeesGroup);

      for (const student_id of student_ids) {
        const existingStudent = await studentRepository.findOne({
          where: { id: student_id },
          relations: ['course', 'semester', 'session'],
        });
        if (!existingStudent) {
          errors.push(`Student with id ${student_id} not found`);
          continue;
        }

        for (const fees_group_id of fees_group_ids) {
          const feesGroup = await feesGroupRepository.findOne({
            where: { id: fees_group_id },
          });
          if (!feesGroup) {
            errors.push(`Fees group with id ${fees_group_id} not found`);
            continue;
          }

          const existingFeesMaster = await feesMasterRepository.findOne({
            where: {
              fees_group_id: fees_group_id,
              student_id: existingStudent.id,
            },
          });

          if (existingFeesMaster) {
            errors.push(
              `Fees Group: ${feesGroup?.name} already added for Student: ${existingStudent?.first_name}`,
            );
            continue;
          }

          // Retrieve fees type data from the FeesGroup
          const feesTypeData = feesGroup.feesTypeData;

          if (!feesTypeData) {
            errors.push(
              `Fees type data for fees group with id ${fees_group_id} not found`,
            );
            continue;
          }

          let netAmount = 0;
          try {
            const feesData = feesTypeData;
            if (Array.isArray(feesData)) {
              feesData.forEach((fee: any) => {
                if (fee.amount) {
                  netAmount += fee.amount;
                }
              });
            }
          } catch (error) {
            console.error('Error parsing fees type data:', error);
            errors.push(
              `Error parsing fees type data for fees group with id ${fees_group_id}`,
            );
            continue;
          }

          const feesMaster = new FeesMaster();
          feesMaster.student = existingStudent;
          feesMaster.student_id = existingStudent.id;
          feesMaster.fees_group_id = fees_group_id;
          feesMaster.feesGroups = [feesGroup];
          feesMaster.net_amount = netAmount;

          await feesMasterRepository.save(feesMaster);
        }

        await createActivityLog(
          req.user?.id || 0,
          `Fees Allocation of Student: ${existingStudent.first_name + ' ' + existingStudent.last_name}, Enrollment No:${existingStudent.enrollment_no}  in Course & Semester: ${existingStudent.course?.name + '(' + existingStudent.semester?.semester + ')' + '-' + existingStudent.session?.session} done by ${req.user?.first_name + ' ' + req.user?.last_name}`,
        );
      }
    });

    await queryRunner.release();

    if (errors.length > 0) {
      return sendError(
        res,
        400,
        'Failed to create fees master records',
        errors.join('; '),
      );
    }

    return sendResponse(res, 201, 'Fees master records created successfully');
  } catch (error: any) {
    console.error('Error creating fees master records:', error);
    return sendError(
      res,
      500,
      'Failed to create fees master records',
      error.message,
    );
  }
};

export const getFeesMasterByStudentId = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;

    const feesMasterRepository = AppDataSource.getRepository(FeesMaster);
    const feesGroupRepository = AppDataSource.getRepository(FeesGroup);

    const feesMasters = await feesMasterRepository
      .createQueryBuilder('feesMaster')
      .leftJoinAndSelect('feesMaster.student', 'student')
      .leftJoinAndSelect('feesMaster.feesGroups', 'feesGroup')

      .where('feesMaster.student_id = :student_id', { student_id })
      .getMany();

    const feesMastersWithFineAmounts = await Promise.all(
      feesMasters.map(async (feesMaster) => {
        let calculatedFineAmount = 0;

        // Check if feesGroup is defined
        if (feesMaster.fees_group_id) {
          const feesGroup = await feesGroupRepository.findOne({
            where: { id: feesMaster.fees_group_id },
          });

          if (feesGroup && feesGroup.feesTypeData) {
            feesGroup.feesTypeData.forEach((feesTypeDataItem) => {
              const currentDate = new Date();
              const dueDate = new Date(feesTypeDataItem.due_date);

              if (dueDate <= currentDate) {
                calculatedFineAmount += feesTypeDataItem.fine_amount;
              }
            });
          }
        }
        return { ...feesMaster, calculatedFineAmount };
      }),
    );

    sendResponse(res, 200, 'Fees masters fetched successfully', {
      feesMasters: feesMastersWithFineAmounts,
    });
  } catch (error: any) {
    console.error('Error fetching fees masters:', error);
    sendError(res, 500, 'Failed to fetch fees masters', error.message);
  }
};

export const collectFees = async (req: Request, res: Response) => {
  try {
    const { student_id, dos, payment_mode, payment } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();

    await runTransaction(queryRunner, async () => {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const feesMasterRepository =
        queryRunner.manager.getRepository(FeesMaster);
      const feesPaymentRepository =
        queryRunner.manager.getRepository(FeesPayment);
      const bankPaymentRepository =
        queryRunner.manager.getRepository(BankPayment);
      const discountRepository = queryRunner.manager.getRepository(Discount);

      const student = await studentRepository.findOne({
        where: { id: student_id },
      });
      if (!student) {
        sendError(res, 400, 'Student not found');
        return;
      }

      for (const paymentData of payment) {
        const {
          fees_master_id,
          amount,
          discount_id,
          discount_amount,
          fine_amount,
        } = paymentData;

        const feesMaster = await feesMasterRepository.findOne({
          where: { id: fees_master_id, student_id: student_id },
          relations: [
            'student',
            'student.course',
            'student.semester',
            'student.session',
          ],
        });
        if (!feesMaster) {
          sendError(
            res,
            400,
            `Fees master with ID ${fees_master_id} not found`,
          );
          return;
        }

        if (discount_id) {
          const discount = await discountRepository.findOne({
            where: { id: discount_id },
          });
          if (!discount) {
            sendError(res, 400, 'Discount Type Not Found');
            return;
          }
        }

        if (discount_amount) {
          feesMaster.net_amount -= discount_amount;
        }
        if (fine_amount) {
          feesMaster.net_amount += fine_amount;
        }

        if (feesMaster.paid_amount + amount > feesMaster.net_amount) {
          sendError(
            res,
            400,
            'Fees Amount Paid exceeds the actual Fees Amount',
          );
          return;
        }

        const feesPayment = new FeesPayment();
        feesPayment.payment_id = (Math.random() + 1).toString(36).substring(7);
        feesPayment.student = student;
        feesPayment.feesMaster = feesMaster;
        feesPayment.dos = dos;
        feesPayment.status = 'Paid';
        feesPayment.amount = amount;
        feesPayment.discount = discount_amount || null;
        feesPayment.fine = fine_amount || null;
        feesPayment.payment_from = student_id;
        feesPayment.payment_mode = payment_mode;

        await feesPaymentRepository.save(feesPayment);

        if (payment_mode === 'Bank Transfer') {
          const bankPayment = new BankPayment();
          bankPayment.feesPayment = feesPayment;
          bankPayment.status_date = dos;

          await bankPaymentRepository.save(bankPayment);
        }

        feesMaster.discount_id = discount_id || null;
        feesMaster.discount_amount += discount_amount || null;
        feesMaster.fine_amount += fine_amount || null;
        feesMaster.paid_amount += amount;
        feesMaster.status =
          feesMaster.paid_amount < feesMaster.net_amount
            ? 'Partially Paid'
            : 'Paid';

        await feesMasterRepository.save(feesMaster);

        await createActivityLog(
          req.user?.id || 0,
          `Fees Collected of Student: ${feesMaster.student.first_name + ' ' + feesMaster.student.last_name}, Enrollment No:${feesMaster.student.enrollment_no}  in Course & Semester: ${feesMaster.student.course?.name + '(' + feesMaster.student.semester?.semester + ')' + '-' + feesMaster.student.session?.session} of Amount: ${amount} by ${req.user?.first_name + ' ' + req.user?.last_name}`,
        );
      }

      sendResponse(res, 200, 'Fees collected successfully');
    });
  } catch (error: any) {
    console.error('Error collecting fees:', error);
    if (!res.headersSent) {
      sendError(res, 500, 'Failed to collect fees', error.message);
    }
  }
};

export const searchFeeDues = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const currentDate = new Date().toISOString().split('T')[0];
    const feesMasterRepository = AppDataSource.getRepository(FeesMaster);
    const { fees_group_id, section_id, course_id, semester_id } = req.query;

    let query = feesMasterRepository
      .createQueryBuilder('feesMaster')
      .innerJoinAndSelect('feesMaster.feesGroups', 'feesGroup')
      .innerJoinAndSelect('feesMaster.student', 'student')
      .innerJoinAndSelect('student.course', 'course')
      .innerJoinAndSelect('student.semester', 'semester')
      .innerJoinAndSelect('student.section', 'section')
      .where('feesMaster.status IN (:...statuses)', {
        statuses: ['Partially Paid', 'Unpaid'],
      });

    if (fees_group_id) {
      query = query.andWhere('feesGroup.id = :fees_group_id', {
        fees_group_id: +fees_group_id,
      });
    }
    if (section_id) {
      query = query.andWhere('section.id = :section_id', {
        section_id: +section_id,
      });
    }
    if (course_id) {
      query = query.andWhere('course.id = :course_id', {
        course_id: +course_id,
      });
    }
    if (semester_id) {
      query = query.andWhere('semester.id = :semester_id', {
        semester_id: +semester_id,
      });
    }

    const feesMasters = await query.getMany();

    const filteredFeesMasters = feesMasters.filter((feesMaster) => {
      return feesMaster.feesGroups.some((feesGroup) => {
        return feesGroup.feesTypeData.some((feesTypeData) => {
          console.log(new Date(feesTypeData.due_date), new Date(currentDate));
          return new Date(feesTypeData.due_date) <= new Date(currentDate);
        });
      });
    });

    const totalCount = filteredFeesMasters.length;
    const totalPages = Math.ceil(totalCount / +limit);
    const offset = (+page - 1) * +limit;
    const paginatedFeesMasters = filteredFeesMasters.slice(
      offset,
      offset + +limit,
    );

    sendResponse(res, 200, 'FeesMaster records found', {
      feesMasters: paginatedFeesMasters,
      totalCount,
      totalNoOfRecords: paginatedFeesMasters.length,
      totalPages,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to get Fees Due records', error.message);
  }
};

export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return sendError(res, 400, 'Student ID is required');
    }

    const studentRepository = AppDataSource.getRepository(Student);
    const studentRecord = await studentRepository.findOne({
      where: { id: +student_id },
    });

    if (!studentRecord) {
      return sendError(res, 400, `Student with ID ${student_id} not found`);
    }

    const feesMasterRepository = AppDataSource.getRepository(FeesMaster);
    const feesMasters = await feesMasterRepository
      .createQueryBuilder('feesMaster')
      .leftJoinAndSelect('feesMaster.feesGroups', 'feesGroup')
      .leftJoinAndSelect('feesMaster.feesPayments', 'feesPayment')
      .leftJoinAndSelect('feesMaster.student', 'student')
      .leftJoinAndSelect('student.course', 'course')
      .leftJoinAndSelect('student.semester', 'semester')
      .leftJoinAndSelect('student.session', 'session')
      .leftJoinAndSelect('student.section', 'section')
      .where('feesMaster.student_id = :studentId', {
        studentId: parseInt(student_id),
      })
      .getMany();

    const feesData = feesMasters.map((feesMaster) => ({
      feesGroups: feesMaster.feesGroups.map((feesGroup) => ({
        ...feesGroup,
        due_date: new Date(feesGroup.due_date).toLocaleDateString('en-GB'),
      })),
      feesMaster: feesMaster,
      feesPayments: feesMaster.feesPayments.map((payment) => ({
        ...payment,
        dos: new Date(payment.dos).toLocaleDateString('en-GB'),
      })),
    }));

    console.log(feesData[4].feesPayments[1].dos);

    if (feesMasters.length === 0) {
      return sendError(
        res,
        404,
        'No records found for the specified student ID',
      );
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    const invoiceDate = new Date().toLocaleDateString('en-GB');

    // Render the EJS template with the data
    const htmlContent = await ejs.renderFile(ejsFilePath, {
      feesData,
      invoiceNumber,
      invoiceDate,
      studentName:
        feesMasters[0].student?.first_name +
        ' ' +
        feesMasters[0].student?.last_name,
      enrollment: feesMasters[0].student?.enrollment_no,
      address: feesMasters[0].student?.current_address,
      course: feesMasters[0].student.course?.name,
      semester: feesMasters[0].student.semester?.semester,
      section: feesMasters[0].student.section?.section,
      year: feesMasters[0].student.session?.session,
    });

    // Define PDF options
    const pdfOptions: pdf.CreateOptions = {
      format: 'A4',
      border: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
      footer: {
        height: '15mm',
        contents: {
          default:
            '<div style="text-align:center;"><span>{{page}} of {{pages}}</span></div>',
        },
      },
    };

    // Generate PDF
    const uploadFolder = path.join(__dirname, '../../../', 'uploads/Invoice');
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }
    const pdfFileName = `invoice_${student_id}.pdf`;
    const pdfFilePath = path.join(uploadFolder, pdfFileName);
    await generatePDF(htmlContent, pdfOptions, pdfFilePath);

    //Changing path for response
    const relativePath = path.relative(
      path.join(__dirname, '../../../'),
      pdfFilePath,
    );

    // Send response
    return sendResponse(res, 200, 'PDF generated successfully', {
      pdfFilePath: '/' + relativePath,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return sendError(res, 500, 'Failed to generate PDF');
  }
};

// Define the path to your EJS file
const ejsFilePath = path.join(
  __dirname,
  '../../../',
  'src',
  'html',
  'feesInvoice.ejs',
);

// Function to generate the PDF
const generatePDF = async (
  htmlContent: string,
  pdfOptions: pdf.CreateOptions,
  pdfFilePath: string,
) => {
  const options: pdf.CreateOptions = {
    ...pdfOptions,
    childProcessOptions: {
      //@ts-ignore
      env: {
        ...process.env,
        OPENSSL_CONF: '/dev/null',
      },
    },
  };
  return new Promise<void>((resolve, reject) => {
    pdf.create(htmlContent, options).toFile(pdfFilePath, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
};

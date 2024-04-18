import { Request, Response } from 'express';
import { FeesMaster } from '../../entity/FeesMaster';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import AppDataSource from '../../data-source';
import { Student } from '../../entity/Student';
import { FeesGroup } from '../../entity/FeesGroup';
import { FeesPayment } from '../../entity/FeesPayment';

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
            const feesData = JSON.parse(feesTypeData);
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
          feesMaster.fees_group_ids = [fees_group_id];
          feesMaster.feesGroups = [feesGroup];
          feesMaster.net_amount = netAmount;

          await feesMasterRepository.save(feesMaster);
        }
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
  } catch (error) {
    console.error('Error creating fees master records:', error);
    return sendError(res, 500, 'Failed to create fees master records', error);
  }
};

export const getFeesMasterByStudentId = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return res.status(400).json({ error: 'Student ID is required' });
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
      .where('feesMaster.student_id = :studentId', {
        studentId: parseInt(student_id),
      })
      .getMany();

    if (feesMasters.length === 0) {
      return res
        .status(404)
        .json({ error: 'No records found for the specified student ID' });
    }

    return res.status(200).json({ feesMasters });
  } catch (error) {
    console.error('Error fetching fees master records:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch fees master records' });
  }
};

export const collectFees = async (req: Request, res: Response) => {
  try {
    const {
      student_id,
      fees_master_id,
      dos,
      amount,
      discount_id,
      discount_amount,
      fine_type_id,
      fine_amount,
      payment_mode,
    } = req.body;

    // Create a query runner using AppDataSource
    const queryRunner = AppDataSource.createQueryRunner();

    // Run the transaction
    await runTransaction(queryRunner, async () => {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const feesMasterRepository =
        queryRunner.manager.getRepository(FeesMaster);
      const feesPaymentRepository =
        queryRunner.manager.getRepository(FeesPayment);

      const student = await studentRepository.findOne({
        where: { id: student_id },
      });
      if (!student) {
        sendError(res, 400, 'Student not found');
        return;
      }

      const feesMaster = await feesMasterRepository.findOne({
        where: { id: fees_master_id, student_id: student_id },
      });
      if (!feesMaster) {
        sendError(res, 400, 'Fees master not found');
        return;
      }

      feesMaster.net_amount -= discount_amount;
      feesMaster.net_amount += fine_amount;

      const feesPayment = new FeesPayment();
      feesPayment.payment_id = (Math.random() + 1).toString(36).substring(7);
      feesPayment.student = student;
      feesPayment.feesMaster = feesMaster;
      feesPayment.dos = dos;
      feesPayment.status = 'Paid';
      feesPayment.amount = amount;
      feesPayment.payment_from = student_id;
      feesPayment.payment_mode = payment_mode;

      // Save the FeesPayment record
      await feesPaymentRepository.save(feesPayment);

      // Update feesMaster record
      feesMaster.discount_id = discount_id;
      feesMaster.discount_amount = discount_amount;
      feesMaster.fineTypeId = fine_type_id;
      feesMaster.fine_amount = fine_amount;
      feesMaster.paid_amount += amount;
      feesMaster.status =
        feesMaster.paid_amount < feesMaster.net_amount
          ? 'Partially Paid'
          : 'Paid';

      // Save the updated feesMaster record
      await feesMasterRepository.save(feesMaster);
    });

    // Send success response
    return sendResponse(res, 200, 'Fees collected successfully');
  } catch (error: any) {
    console.error('Error collecting fees:', error);
    // Send error response
    return sendError(res, 500, 'Failed to collect fees', error.message);
  }
};

export const searchFeeDues = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();

    const feesMasterRepository = AppDataSource.getRepository(FeesMaster);

    const { feesGroup, section, course, semester } = req.query;

    // Build the base query
    let query = feesMasterRepository
      .createQueryBuilder('feesMaster')
      .innerJoinAndSelect('feesMaster.feesGroups', 'feesGroup')
      .innerJoinAndSelect('feesMaster.student', 'student')
      .innerJoinAndSelect('student.course', 'course')
      .innerJoinAndSelect('student.semester', 'semester')
      .innerJoinAndSelect('student.section', 'section')
      .where('feesMaster.status IN (:...statuses)', {
        statuses: ['Partially Paid', 'Unpaid'],
      })
      .andWhere('feesGroup.due_date <= :currentDate', { currentDate });

    // Add optional search conditions
    if (feesGroup) {
      query = query.andWhere('feesGroup.name ILIKE :feesGroup', {
        feesGroup: `%${feesGroup}%`,
      });
    }
    if (section) {
      query = query.andWhere('section.section ILIKE :section', {
        section: `%${section}%`,
      });
    }
    if (course) {
      query = query.andWhere('course.name ILIKE :course', {
        course: `%${course}%`,
      });
    }
    if (semester) {
      query = query.andWhere('semester.semester ILIKE :semester', {
        semester: `%${semester}%`,
      });
    }

    const feesMasters = await query.getMany();

    sendResponse(res, 200, 'FeesMaster records found', feesMasters);
  } catch (error: any) {
    sendError(res, 500, 'Failed to get FeesMaster records', error.message);
  }
};

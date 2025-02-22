import e, { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Payroll } from '../../entity/Payroll';
import { Employee } from '../../entity/Employee';
import { StaffLoan } from '../../entity/StaffLoan';
import { Installment } from '../../entity/Installment';
import { Attendance } from '../../entity/Attendance';
import { DeepPartial, Like } from 'typeorm';
import { createActivityLog } from '../../utils/activityLog';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import * as pdf from 'html-pdf';

// Get all payrolls
export const getAllPayrolls = async (req: Request, res: Response) => {
  try {
    const {
      month,
      year,
      department,
      name,
      role_id,
      is_deduction_collected,
      page,
      limit,
    } = req.query;

    const payrollRepository = AppDataSource.getRepository(Payroll);
    const queryBuilder = payrollRepository
      .createQueryBuilder('payroll')
      .leftJoinAndSelect('payroll.employee', 'employee')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoin('employee.user', 'user');

    if (month) {
      queryBuilder.andWhere('payroll.month ILIKE :month', {
        month: `%${month}%`,
      });
    }
    if (year) {
      queryBuilder.andWhere('payroll.year ILIKE :year', { year: `%${year}%` });
    }
    if (name) {
      queryBuilder.andWhere(
        '(user.first_name ILIKE :name OR user.last_name ILIKE :name OR user.father_name ILIKE :name)',
        { name: `%${name}%` },
      );
    }
    if (department) {
      queryBuilder.andWhere('department.department ILIKE :department', {
        department: `%${department}%`,
      });
    }

    if (role_id) {
      queryBuilder.andWhere('user.role_id = :role_id', { role_id });
    }
    if (is_deduction_collected !== undefined) {
      queryBuilder.andWhere(
        'payroll.is_deduction_collected = :is_deduction_collected',
        { is_deduction_collected },
      );
    }

    // Apply pagination if page and limit are provided
    let totalRecords = 0;
    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      queryBuilder.skip(skip).take(limitNumber);
    }
    totalRecords = await queryBuilder.getCount();
    const payrolls = await queryBuilder.getMany();
    sendResponse(res, 200, 'Success', {
      payrolls,
      totalRecords,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch payrolls', error.message);
  }
};

// Get payroll by ID
export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payrollRepository = AppDataSource.getRepository(Payroll);
    const payroll = await payrollRepository.findOne({
      where: { id: +id },
      relations: ['employee'],
    });
    if (!payroll) {
      sendError(res, 404, 'Payroll not found');
      return;
    }
    sendResponse(res, 200, 'Success', payroll);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch payroll', error.message);
  }
};

// Create payroll
export const createPayroll = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    const { employee_id, month, year, tax } = body;

    const employeeRepository = AppDataSource.getRepository(Employee);
    const payrollRepository = AppDataSource.getRepository(Payroll);
    const employee = await employeeRepository.findOne({
      where: { id: employee_id },
      relations: ['user'],
    });
    if (!employee) {
      sendError(res, 404, 'Employee not found');
      return;
    }

    const existingPayroll = await payrollRepository.findOne({
      where: { employee: { id: employee_id }, month, year },
    });

    if (existingPayroll) {
      sendError(
        res,
        400,
        `Payroll for Month-Year: ${month + '-' + year} already exists`,
      );
      return;
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const payrollRepository = queryRunner.manager.getRepository(Payroll);
      const staffLoanRepository = queryRunner.manager.getRepository(StaffLoan);
      const installmentRepository =
        queryRunner.manager.getRepository(Installment);
      const existingStaffLoan = await queryRunner.manager
        .getRepository(StaffLoan)
        .find({
          where: { type: 'Staff Loan', employee: { id: employee_id } },
        });

      let totalInstallmentAmount = 0;
      if (existingStaffLoan) {
        for (const loan of existingStaffLoan) {
          const installmentForMonthYear = await installmentRepository.find({
            where: {
              staff_loan: loan,
              month: month,
              year: year,
            },
          });

          for (const installment of installmentForMonthYear) {
            totalInstallmentAmount += installment.amount;
          }
        }
      }
      const earningTotal = calculateTotalAmount(body.earning);
      const deductionTotal = calculateTotalAmount(body.deduction);
      const gross_salary =
        employee.salary +
        earningTotal.amount -
        deductionTotal.amount -
        totalInstallmentAmount;

      const net_salary = gross_salary - tax;

      const newPayroll: DeepPartial<Payroll> = {
        employee: { id: employee_id },
        status: 'Generated',
        month,
        year,
        earning: req.body.earning,
        deduction: req.body.deduction,
        gross_salary: gross_salary,
        tax,
        net_amount: net_salary,
        is_staff_loan: existingStaffLoan ? true : false,
        loan_deduction_amount: existingStaffLoan
          ? req.body.loan_deduction_amount
          : null,
      };
      await payrollRepository.save(newPayroll);

      if (existingStaffLoan && existingStaffLoan.length > 0) {
        for (const loan of existingStaffLoan) {
          await installmentRepository.update(
            {
              staff_loan: { id: loan.id },
              month,
              year,
            },
            {
              status: true,
            },
          );

          const paidLoan = await installmentRepository.find({
            where: { staff_loan: { id: loan.id }, status: false },
          });

          if (paidLoan.length === 0) {
            await staffLoanRepository.update(
              { id: loan.id, employee: { id: employee_id } },
              { status: 'Paid' },
            );
          }
        }
      }

      const newStaffLoan = staffLoanRepository.create({
        employee: employee,
        loan_amount: employee.deduction,
        no_of_installments: 1,
        installment_amount: employee.deduction,
        status: 'Pending',
        action_by: req.user?.role_id,
        type: 'Deduction',
      });
      await staffLoanRepository.save(newStaffLoan);

      const newInstallment = installmentRepository.create({
        staff_loan: newStaffLoan,
        pay_date: null as any,
        amount: employee.deduction,
        month,
        year,
      });
      await installmentRepository.save(newInstallment);

      await createActivityLog(
        req.user?.id || 0,
        `Payroll for Employee ${employee.user.first_name + ' ' + employee.user.last_name} of Month & Year: ${month + ' ' + year} was generated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 201, 'Payroll created successfully', newPayroll);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create payroll', error.message);
  }
};

const calculateTotalAmount = (
  items: any[],
): { name: string; amount: number } => {
  let totalAmount = 0;
  for (const item of items) {
    if (!item.name || !item.amount || isNaN(item.amount)) {
      throw new Error(
        'Invalid payload. Name and amount are required for each item.',
      );
    }
    totalAmount += item.amount;
  }
  return { name: 'Total', amount: totalAmount };
};

// Update payroll by ID
export const updatePayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payrollRepository = AppDataSource.getRepository(Payroll);
    const payrollToUpdate = await payrollRepository.findOne({
      where: { id: +id },
      relations: ['employee'],
    });
    if (!payrollToUpdate) {
      return sendError(res, 404, 'Payroll not found');
    }

    const employeeRepository = AppDataSource.getRepository(Employee);
    const employee = await employeeRepository.findOne({
      where: { id: payrollToUpdate.employee.id },
      relations: ['user'],
    });
    if (!employee) {
      return sendError(res, 404, 'Employee not found');
    }

    Object.assign(payrollToUpdate, req.body);

    payrollToUpdate.employee = employee;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      await payrollRepository.save(payrollToUpdate);

      if (req.body.is_deduction_collected) {
        const staffLoanRepository =
          queryRunner.manager.getRepository(StaffLoan);
        const staffLoan = await staffLoanRepository.findOne({
          where: {
            employee: { id: payrollToUpdate.employee.id },
            type: 'Deduction',
          },
        });
        if (staffLoan) {
          staffLoan.status = 'Paid';
          staffLoan.collected_on_date = req.body.deduction_collected_on_date;
          await staffLoanRepository.save(staffLoan);

          const installmentRepository =
            queryRunner.manager.getRepository(Installment);
          const installment = await installmentRepository.findOne({
            where: { staff_loan: { id: staffLoan.id } },
          });
          if (installment) {
            installment.status = true;
            installment.pay_date = req.body.deduction_collected_on_date;
            await installmentRepository.save(installment);
          }
        }
      }

      await createActivityLog(
        req.user?.id || 0,
        `Payroll for Employee ${employee.user.first_name + ' ' + employee.user.last_name} of Month & Year: ${payrollToUpdate.month + ' ' + payrollToUpdate.year} was updated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Payroll updated successfully', payrollToUpdate);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update payroll', error.message);
  }
};

// Delete payroll by ID
export const deletePayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const payrollRepository = queryRunner.manager.getRepository(Payroll);
      const payroll = await payrollRepository.findOne({
        where: { id: +id },
        relations: ['employee', 'employee.user'],
      });
      if (!payroll) {
        sendError(res, 404, 'Payroll not found');
        return;
      }
      await payrollRepository.delete(id);

      await createActivityLog(
        req.user?.id || 0,
        `Payroll for Employee ${payroll.employee.user?.first_name + ' ' + payroll.employee.user?.last_name} of Month & Year: ${payroll.month + ' ' + payroll.year} was deleted by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Payroll deleted successfully');
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete payroll', error.message);
  }
};

// Get all the Staff Deduction History
export const staffDeduction = async (req: Request, res: Response) => {
  try {
    const { search, role, page, limit } = req.query;

    const staffLoanRepository = AppDataSource.getRepository(StaffLoan);

    let queryBuilder = staffLoanRepository
      .createQueryBuilder('staffLoan')
      .leftJoinAndSelect('staffLoan.employee', 'employee')
      .leftJoinAndSelect('staffLoan.installments', 'installment')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect(
        'employee.payroll',
        'payroll',
        'payroll.month = installment.month AND payroll.year = installment.year',
      )
      .leftJoinAndSelect('user.role', 'employeeRole')
      .where('staffLoan.type = :type', { type: 'Deduction' });

    if (search) {
      queryBuilder = queryBuilder.andWhere((qb) => {
        qb.where('employee.staff_id ILIKE :search', { search: `%${search}%` })
          .orWhere('user.first_name ILIKE :search', { search: `%${search}%` })
          .orWhere('user.last_name ILIKE :search', { search: `%${search}%` })
          .orWhere('user.father_name ILIKE :search', { search: `%${search}%` })
          .orWhere('designation.designation ILIKE :search', {
            search: `%${search}%`,
          });
      });
    }

    if (role) {
      queryBuilder = queryBuilder.andWhere('employeeRole.name ILIKE :role', {
        role: `%${role}%`,
      });
    }

    let totalCount = await queryBuilder.getCount();

    let limitedDeductions;

    if (page && limit) {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const startIndex = (pageNumber - 1) * limitNumber;

      limitedDeductions = await queryBuilder
        .take(limitNumber)
        .skip(startIndex)
        .getMany();
    } else {
      // If page and limit are not provided, fetch all records
      limitedDeductions = await queryBuilder.getMany();
    }

    sendResponse(res, 200, 'Deductions fetched successfully', {
      deductions: limitedDeductions,
      totalCount,
      totalNoOfRecords: totalCount,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch deductions', error.message);
  }
};

export const getEmployeePayrollDetails = async (
  req: Request,
  res: Response,
) => {
  try {
    const { employee_id, month, year } = req.query;

    if (!employee_id || !month || !year) {
      return sendError(res, 400, 'Employee ID, Month & Year Required');
    }

    let staffLoan;
    let employee;
    if (employee_id) {
      employee = await AppDataSource.getRepository(Employee).findOne({
        where: { id: +employee_id },
        relations: ['department', 'designation', 'user', 'user.role'],
      });

      if (!employee) {
        return sendError(res, 404, 'Employee not found');
      }
      staffLoan = await AppDataSource.getRepository(StaffLoan).findOne({
        where: { employee: { id: +employee_id }, type: 'Staff Loan' },
      });
    }

    const staffLoanExists = !!staffLoan;

    let installmentAmount = 0;
    if (staffLoan) {
      if (staffLoanExists) {
        const installmentRepository = AppDataSource.getRepository(Installment);
        const installment = await installmentRepository.findOne({
          where: {
            staff_loan: { id: +staffLoan.id },
            month: month as string,
            year: year as string,
          },
        });

        if (installment) {
          installmentAmount = installment.amount;
        }
      }
    }

    const monthString = month as string;
    const months = [
      monthString,
      getPreviousMonth(monthString),
      getPreviousMonth(getPreviousMonth(monthString)),
    ].reverse();

    const attendanceData = await Promise.all(
      months.map(async (m) => {
        const startDate = new Date(`${m} 1, ${year}`);
        const endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
        );

        const attendanceRecords = await AppDataSource.getRepository(Attendance)
          .createQueryBuilder('attendance')
          .select('attendance.attendance')
          .where('attendance.employeeId = :employeeId', {
            employeeId: employee_id,
          })
          .andWhere('attendance.date >= :startDate', {
            startDate: startDate.toISOString().split('T')[0],
          })
          .andWhere('attendance.date <= :endDate', {
            endDate: endDate.toISOString().split('T')[0],
          })
          .getRawMany();

        const attendance = attendanceRecords.reduce(
          (counts, record) => {
            const attendanceType = record.attendance_attendance;
            counts[attendanceType] = (counts[attendanceType] || 0) + 1;
            return counts;
          },
          {
            Present: 0,
            Late: 0,
            Absent: 0,
            'Half Day': 0,
            Holiday: 0,
          },
        );

        return { month: m, attendance };
      }),
    );

    const response = {
      employeeDetails: employee,
      staffLoanExists: staffLoanExists,
      installmentAmount: installmentAmount,
      attendance: attendanceData,
    };

    sendResponse(res, 200, 'Employee details fetched successfully', response);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch employee details');
  }
};

const getPreviousMonth = (currentMonth: string): string => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const index = months.findIndex((month) => month === currentMonth);
  const previousIndex = index === 0 ? 11 : index - 1;
  return months[previousIndex];
};

export const payrollReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 400, 'Payroll ID is required');
    }

    const payrollRepository = AppDataSource.getRepository(Payroll);
    const payrollRecord = await payrollRepository.findOne({
      where: { id: +id },
      relations: [
        'employee',
        'employee.department',
        'employee.designation',
        'employee.user',
      ],
    });

    if (!payrollRecord) {
      return sendError(res, 404, `Payroll with ID ${id} not found`);
    }

    const htmlContent = await ejs.renderFile(ejsFilePath, {
      payroll: payrollRecord,
    });

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

    const uploadFolder = path.join(__dirname, '../../../', 'uploads/Receipt');
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }
    const pdfFileName = `payroll_receipt_${id}.pdf`;
    const pdfFilePath = path.join(uploadFolder, pdfFileName);
    await generatePDF(htmlContent, pdfOptions, pdfFilePath);

    const relativePath = path.relative(
      path.join(__dirname, '../../../'),
      pdfFilePath,
    );

    return sendResponse(res, 200, 'PDF generated successfully', {
      pdfFilePath: '/' + relativePath,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return sendError(res, 500, 'Failed to generate PDF');
  }
};

const ejsFilePath = path.join(
  __dirname,
  '../../../',
  'src',
  'html',
  'payrollReceipt.ejs',
);

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

import AppDataSource from '../../data-source';
import { BankPayment } from '../../entity/BankPayment';
import { createActivityLog } from '../../utils/activityLog';
import { sendError, sendResponse } from '../../utils/commonResponse';
import { Request, Response } from 'express';

// Update API
export const updateBankPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const bankPaymentRepository = AppDataSource.getRepository(BankPayment);

    const bankPayment = await bankPaymentRepository.findOne({
      where: { id: +id },
    });
    if (!bankPayment) {
      sendError(res, 404, 'BankPayment not found');
      return;
    }

    bankPayment.status = status || bankPayment.status;
    bankPayment.status_date = new Date();
    bankPayment.comment = comment || bankPayment.comment || null;

    await bankPaymentRepository.save(bankPayment);

    await createActivityLog(
      req.user?.id || 0,
      `Bank Payment for Student: ${bankPayment.feesPayment.student.first_name + ' ' + bankPayment.feesPayment.student.last_name} in Course & Semester: ${bankPayment.feesPayment.student.course.name + '(' + bankPayment.feesPayment.student.semester.semester + ')' + '-' + bankPayment.feesPayment.student.session.session} updated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
    );

    sendResponse(res, 200, 'BankPayment updated successfully', bankPayment);
  } catch (error: any) {
    console.error('Error updating BankPayment:', error);
    sendError(res, 500, 'Failed to update BankPayment', error.message);
  }
};

// List API
export const getAllBankPayments = async (req: Request, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search) : '';
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const query = AppDataSource.getRepository(BankPayment)
      .createQueryBuilder('bank_payment')
      .leftJoinAndSelect('bank_payment.feesPayment', 'feesPayment')
      .leftJoinAndSelect('feesPayment.student', 'student')
      .leftJoinAndSelect('feesPayment.feesMaster', 'feesMaster')
      .leftJoinAndSelect('feesMaster.feesGroups', 'feesGroups')
      .leftJoinAndSelect('student.course', 'course')
      .leftJoinAndSelect('student.semester', 'semester')
      .leftJoinAndSelect('student.session', 'session')
      .leftJoinAndSelect('student.section', 'section')
      .orderBy('bank_payment.id', 'DESC');

    if (search) {
      query
        .where('student.admission_no LIKE :search', { search: `%${search}%` })
        .orWhere('student.first_name LIKE :search', { search: `%${search}%` })
        .orWhere('student.last_name LIKE :search', { search: `%${search}%` })
        .orWhere('student.middle_name LIKE :search', { search: `%${search}%` })
        .orWhere('feesPayment.payment_id LIKE :search', {
          search: `%${search}%`,
        });
    }

    const [bankPayments, totalCount] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalNoOfRecords = bankPayments.length;

    sendResponse(res, 200, 'BankPayments retrieved successfully', {
      bankPayments,
      totalCount,
      totalNoOfRecords,
    });
  } catch (error: any) {
    console.error('Error fetching BankPayments:', error);
    sendError(res, 500, 'Failed to retrieve BankPayments', error.message);
  }
};

// View by ID API
export const viewBankPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bankPaymentRepository = AppDataSource.getRepository(BankPayment);

    const bankPayment = await bankPaymentRepository.findOne({
      where: { id: +id },
      relations: [
        'feesPayment',
        'feesPayment.student',
        'feesPayment.feesMaster',
      ],
    });

    if (!bankPayment) {
      sendError(res, 404, 'BankPayment not found');
      return;
    }

    // Send success response with the BankPayment record
    sendResponse(res, 200, 'BankPayment retrieved successfully', bankPayment);
  } catch (error: any) {
    console.error('Error fetching BankPayment by ID:', error);
    sendError(res, 500, 'Failed to retrieve BankPayment', error.message);
  }
};

// Delete API
export const deleteBankPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bankPaymentRepository = AppDataSource.getRepository(BankPayment);

    // Find the BankPayment record by ID
    const bankPayment = await bankPaymentRepository.findOne({
      where: { id: +id },
    });

    if (!bankPayment) {
      sendError(res, 404, 'BankPayment not found');
      return;
    }

    // Delete the BankPayment record
    await bankPaymentRepository.remove(bankPayment);

    await createActivityLog(
      req.user?.id || 0,
      `Bank Payment for Student: ${bankPayment.feesPayment.student.first_name + ' ' + bankPayment.feesPayment.student.last_name} in Course & Semester: ${bankPayment.feesPayment.student.course.name + '(' + bankPayment.feesPayment.student.semester.semester + ')' + '-' + bankPayment.feesPayment.student.session.session} deleted by ${req.user?.first_name + ' ' + req.user?.last_name}`,
    );

    // Send success response
    sendResponse(res, 200, 'BankPayment deleted successfully');
  } catch (error: any) {
    console.error('Error deleting BankPayment:', error);
    sendError(res, 500, 'Failed to delete BankPayment', error.message);
  }
};

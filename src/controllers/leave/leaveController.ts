import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { LeaveType } from '../../entity/LeaveType';
import { Leave } from '../../entity/Leave';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Employee } from '../../entity/Employee';
import configureMulter from '../../utils/multerConfig';
import multer from 'multer';
import { LeaveDetail } from '../../entity/LeaveDetails';
import { createActivityLog } from '../../utils/activityLog';

const upload = configureMulter('./uploads/Leave', 2 * 1024 * 1024); // 2MB limit

export const applyLeave = async (req: Request, res: Response) => {
  try {
    upload.single('attachment')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        if (err instanceof multer.MulterError) {
          sendError(res, 400, 'File upload error: ' + err.message);
          return;
        } else {
          sendError(res, 500, 'Failed to upload profile picture');
          return;
        }
      }

      let attachment = '';
      if (req.file) {
        attachment = req.file.path;
      }

      const {
        leave_type_id,
        employee_id,
        apply_date,
        leave_from,
        leave_to,
        reason,
      } = req.body;

      if (
        !leave_type_id ||
        !employee_id ||
        !apply_date ||
        !leave_from ||
        !leave_to
      ) {
        sendError(res, 400, 'Required fields are missing');
        return;
      }

      const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
      const employeeRepository = AppDataSource.getRepository(Employee);
      const leaveType = await leaveTypeRepository.findOne({
        where: { id: leave_type_id },
      });
      if (!leaveType) {
        sendError(res, 400, 'Leave Type Not Found');
        return;
      }
      const employee = await employeeRepository.findOne({
        where: { id: employee_id },
      });
      if (!employee) {
        sendError(res, 400, 'Employee Not Found');
        return;
      }
      const no_of_leave_days = Math.round(
        (new Date(leave_to).getTime() - new Date(leave_from).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const leaveRepository = AppDataSource.getRepository(Leave);
      const newLeave = leaveRepository.create({
        leaveType: leaveType,
        employee: employee,
        apply_date,
        leave_from,
        leave_to,
        reason: reason || null,
        attachment: attachment || null,
        no_of_leave_days,
      });
      await leaveRepository.save(newLeave);
      sendResponse(res, 201, 'Leave created successfully', newLeave);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create leave', error.message);
  }
};

export const updateLeave = async (req: Request, res: Response) => {
  try {
    upload.single('attachment')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        if (err instanceof multer.MulterError) {
          sendError(res, 400, 'File upload error: ' + err.message);
          return;
        } else {
          sendError(res, 500, 'Failed to upload attachment');
          return;
        }
      }
      const { id } = req.params;
      const { leave_type_id, employee_id, leave_from, leave_to, status } =
        req.body;

      const leaveRepository = AppDataSource.getRepository(Leave);
      const leaveTypeRepository = AppDataSource.getRepository(LeaveType);
      const employeeRepository = AppDataSource.getRepository(Employee);
      const leaveDetailRepository = AppDataSource.getRepository(LeaveDetail);

      const leave = await leaveRepository.findOne({
        where: { id: +id },
        relations: ['employee', 'leaveType', 'employee.user'],
      });
      if (!leave) {
        sendError(res, 404, 'Leave not found');
        return;
      }

      const leaveType = await leaveTypeRepository.findOne({
        where: { id: leave_type_id },
      });
      if (!leaveType) {
        sendError(res, 400, 'Leave Type Not Found');
        return;
      }

      const employee = await employeeRepository.findOne({
        where: { id: employee_id },
      });
      if (!employee) {
        sendError(res, 400, 'Employee Not Found');
        return;
      }

      const leaveDetail = await leaveDetailRepository.findOne({
        where: {
          leaveType: leave.leaveType,
          employee: leave.employee,
        },
      });

      const no_of_leave_days = Math.round(
        (new Date(leave_to).getTime() - new Date(leave_from).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (status === 'Approved' && leaveDetail) {
        leaveDetail.availableLeaves -= +no_of_leave_days;
        await leaveDetailRepository.save(leaveDetail);
      }

      let attachment = leave.attachment;

      if (req.file) {
        attachment = req.file.path;
      }

      Object.assign(leave, {
        ...req.body,
        leaveType,
        employee,
        no_of_leave_days,
        attachment,
      });

      await leaveRepository.save(leave);

      await createActivityLog(
        req.user?.id || 0,
        `Leave record of Employee: ${leave.employee.user?.first_name} of Days: ${leave.no_of_leave_days} was updated by ${req.user?.first_name + ' ' + req.user?.last_name}`,
      );

      sendResponse(res, 200, 'Leave updated successfully', leave);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update leave', error.message);
  }
};

export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      sendError(res, 400, 'Leave ID is required');
      return;
    }

    const leaveRepository = AppDataSource.getRepository(Leave);
    const leave = await leaveRepository.findOne({ where: { id: +id } });

    if (!leave) {
      sendError(res, 404, 'Leave not found');
      return;
    }

    await createActivityLog(
      req.user?.id || 0,
      `Leave record of Employee: ${leave.employee.user.first_name} of Days: ${leave.no_of_leave_days} was deleted by ${req.user?.first_name + ' ' + req.user?.last_name}`,
    );

    await leaveRepository.remove(leave);
    sendResponse(res, 200, 'Leave deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete leave', error.message);
  }
};

export const listLeaveByEmployeeId = async (req: Request, res: Response) => {
  try {
    const { employeeId, page = 1, limit = 10 } = req.params;

    if (!employeeId) {
      sendError(res, 400, 'Employee ID is required');
      return;
    }

    const employeeRepository = AppDataSource.getRepository(Employee);

    const employee = await employeeRepository.findOne({
      where: { id: +employeeId },
      // relations: ['leaveType', 'employee', 'employee.user', 'user.role'],
    });

    if (!employee) {
      sendError(res, 400, 'Employee Does Not Exist');
      return;
    }

    const leaveRepository = AppDataSource.getRepository(Leave);

    const qb = leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.leaveType', 'leaveType')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .where('leave.employee = :employeeId', { employeeId: +employeeId });

    if (req.query.page && req.query.limit) {
      qb.skip((+req.query.page - 1) * +req.query.limit).take(+req.query.limit);
    }

    const [leaves, totalRecords] = await qb.getManyAndCount();

    if (page && limit) {
      const totalCount = await qb.getCount();
      const totalNoOfRecords = Math.ceil(totalCount / +limit);

      sendResponse(res, 200, `Leaves of Employee`, {
        leaves,
        totalNoOfRecords,
        totalRecords,
      });
    } else {
      sendResponse(res, 200, `Leaves of Employee`, leaves);
    }
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch leave', error.message);
  }
};

export const listLeaves = async (req: Request, res: Response) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const leaveRepository = AppDataSource.getRepository(Leave);
    const qb = leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.leaveType', 'leaveType')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('user.role', 'role');

    if (role) {
      qb.where('role.name ILIKE :role', { role: `%${role}%` });
    }

    if (search) {
      qb.where(
        'user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.father_name ILIKE :search OR leaveType.name ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const totalCount = await qb.getCount();
    const leaves = await qb
      .skip((+page - 1) * +limit)
      .take(+limit)
      .getMany();

    const totalNoOfRecords = leaves.length;

    sendResponse(res, 200, 'Leaves retrieved successfully', {
      leaves,
      totalCount,
      totalNoOfRecords,
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to retrieve leaves', error.message);
  }
};

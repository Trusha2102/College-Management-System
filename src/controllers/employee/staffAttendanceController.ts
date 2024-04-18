import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Attendance } from '../../entity/Attendance';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import { Employee } from '../../entity/Employee';

// Create attendance
export const createAttendance = async (req: Request, res: Response) => {
  try {
    const attendanceRecords = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    const attendanceRepository = queryRunner.manager.getRepository(Attendance);
    const employeeRepository = queryRunner.manager.getRepository(Employee);

    const errors: string[] = [];

    await runTransaction(queryRunner, async () => {
      for (const attendanceData of attendanceRecords) {
        const employee = await employeeRepository.findOne({
          where: { id: attendanceData.employee_id },
        });

        if (!employee) {
          errors.push(
            `Employee Not Found for ID: ${attendanceData.employee_id}`,
          );
          continue;
        }

        const formattedDate = new Date(attendanceData.date).toISOString();

        const existingRecord = await attendanceRepository.findOne({
          where: {
            employee: { id: attendanceData.employee_id },
            date: new Date(formattedDate),
          },
        });

        if (existingRecord) {
          errors.push(
            `Attendance record already exists for Employee ID ${attendanceData.employee_id} on ${formattedDate}`,
          );
          continue;
        }

        const attendanceInstance = new Attendance();
        attendanceInstance.employee = employee;
        attendanceInstance.date = new Date(formattedDate);
        attendanceInstance.attendance = attendanceData.attendance;

        // Save the attendance record
        await attendanceRepository.save(attendanceInstance);
      }
    });

    if (errors.length > 0) {
      return sendError(
        res,
        400,
        'Errors occurred while creating attendance',
        errors.join('; '),
      );
    }

    sendResponse(
      res,
      201,
      'Attendance created successfully',
      attendanceRecords,
    );
  } catch (error: any) {
    sendError(res, 500, 'Failed to create attendance', error.message);
  }
};

// Get all attendances
export const getAllAttendances = async (req: Request, res: Response) => {
  try {
    console.log('THE STAFF ATTENDANCE GET CONTROLLER WAS CALLED');
    const { date, employeeId } = req.query;
    const attendanceRepository = AppDataSource.getRepository(Attendance);
    let query = attendanceRepository.createQueryBuilder('attendance');

    // If date is provided, filter by date
    if (date) {
      query = query.where('DATE(attendance.date) = DATE(:date)', {
        date: date,
      });
    }

    // If employeeId is provided, filter by employeeId
    if (employeeId) {
      query = query.andWhere('attendance.employeeId = :employeeId', {
        employeeId: parseInt(employeeId as string),
      });
    }

    // Apply ordering by createdAt in descending order
    query = query.orderBy('attendance.createdAt', 'DESC');

    // Fetch the attendances based on the query
    const attendances = await query.getMany();

    sendResponse(res, 200, 'Success', attendances);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch attendances', error.message);
  }
};

// Get attendance by ID
export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attendanceRepository = AppDataSource.getRepository(Attendance);
    const attendance = await attendanceRepository.findOne({
      where: { id: +id },
    });
    if (!attendance) {
      return sendError(res, 404, 'Attendance not found');
    }
    sendResponse(res, 200, 'Success', attendance);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch attendance', error.message);
  }
};

// Update attendance by ID
export const updateAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employee_id, date, attendance } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();

    const attendanceRepository = queryRunner.manager.getRepository(Attendance);
    const attendanceToUpdate = await attendanceRepository.findOne({
      where: { id: +id },
    });
    if (!attendanceToUpdate) {
      return sendError(res, 404, 'Attendance not found');
    }

    attendanceToUpdate.employee = employee_id;
    attendanceToUpdate.date = date;
    attendanceToUpdate.attendance = attendance;

    await runTransaction(queryRunner, async () => {
      await attendanceRepository.save(attendanceToUpdate);
    });

    sendResponse(
      res,
      200,
      'Attendance updated successfully',
      attendanceToUpdate,
    );
  } catch (error: any) {
    sendError(res, 500, 'Failed to update attendance', error.message);
  }
};

// Delete attendance by ID
export const deleteAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attendanceRepository = AppDataSource.getRepository(Attendance);
    const attendanceToDelete = await attendanceRepository.findOne({
      where: { id: +id },
    });
    if (!attendanceToDelete) {
      return sendError(res, 404, 'Attendance not found');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      await attendanceRepository.delete(id);
    });

    sendResponse(res, 200, 'Attendance deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete attendance', error.message);
  }
};

import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Attendance } from '../../entity/Attendance';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

// Create attendance
export const createAttendance = async (req: Request, res: Response) => {
  try {
    const attendanceRecords = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    const attendanceRepository = queryRunner.manager.getRepository(Attendance);

    await runTransaction(queryRunner, async () => {
      // Loop through each attendance record in the array
      for (const attendanceData of attendanceRecords) {
        // Create a new instance of Attendance for each record
        const attendanceInstance = new Attendance();
        attendanceInstance.employee = attendanceData.employee_id;
        attendanceInstance.date = attendanceData.date;
        attendanceInstance.attendance = attendanceData.attendance;

        // Save the attendance record
        await attendanceRepository.save(attendanceInstance);
      }
    });

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
    const attendanceRepository = AppDataSource.getRepository(Attendance);
    const attendances = await attendanceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
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

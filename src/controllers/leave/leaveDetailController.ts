import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { LeaveDetail } from '../../entity/LeaveDetails';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

// Create LeaveDetail
// export const createLeaveDetail = async (req: Request, res: Response) => {
//   try {
//     await runTransaction(AppDataSource.createQueryRunner(), async () => {
//       const leaveDetailRepository = AppDataSource.getRepository(LeaveDetail);
//       const newLeaveDetail = leaveDetailRepository.create(req.body);
//       const createdLeaveDetail =
//         await leaveDetailRepository.save(newLeaveDetail);
//       sendResponse(
//         res,
//         201,
//         'Leave detail created successfully',
//         createdLeaveDetail,
//       );
//     });
//   } catch (error) {
//     sendError(res, 500, 'Failed to create leave detail', error);
//   }
// };

// Update LeaveDetail by ID
export const updateLeaveDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await runTransaction(AppDataSource.createQueryRunner(), async () => {
      const leaveDetailRepository = AppDataSource.getRepository(LeaveDetail);
      const leaveDetail = await leaveDetailRepository.findOne({
        where: { id: +id },
      });
      if (!leaveDetail) {
        sendError(res, 404, 'Leave detail not found');
        return;
      }
      leaveDetailRepository.merge(leaveDetail, req.body);
      const updatedLeaveDetail = await leaveDetailRepository.save(leaveDetail);
      sendResponse(
        res,
        200,
        'Leave detail updated successfully',
        updatedLeaveDetail,
      );
    });
  } catch (error) {
    sendError(res, 500, 'Failed to update leave detail', error);
  }
};

// Delete LeaveDetail by ID
export const deleteLeaveDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await runTransaction(AppDataSource.createQueryRunner(), async () => {
      const leaveDetailRepository = AppDataSource.getRepository(LeaveDetail);
      const leaveDetail = await leaveDetailRepository.findOne({
        where: { id: +id },
      });
      if (!leaveDetail) {
        sendError(res, 404, 'Leave detail not found');
        return;
      }
      await leaveDetailRepository.remove(leaveDetail);
      sendResponse(res, 200, 'Leave detail deleted successfully');
    });
  } catch (error) {
    sendError(res, 500, 'Failed to delete leave detail', error);
  }
};

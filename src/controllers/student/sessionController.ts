import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Session } from '../../entity/Session';
import runTransaction from '../../utils/runTransaction';
import { sendResponse, sendError } from '../../utils/commonResponse';

// Create a new session
export const createSession = async (req: Request, res: Response) => {
  try {
    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const sessionRepository = queryRunner.manager.getRepository(Session);
      const newSession = sessionRepository.create(req.body);
      await sessionRepository.save(newSession);
      sendResponse(res, 201, 'Session created successfully', newSession);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to create session', error.message);
  }
};

// Get all sessions
export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessionRepository = AppDataSource.getRepository(Session);
    const sessions = await sessionRepository.find();
    sendResponse(res, 200, 'Sessions fetched successfully', sessions);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch sessions', error.message);
  }
};

// Get session by ID
export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionRepository = AppDataSource.getRepository(Session);
    const session = await sessionRepository.findOne({
      where: { id: +id },
    });
    if (!session) {
      sendError(res, 404, 'Session not found', 'Session not found');
      return;
    }
    sendResponse(res, 200, 'Session fetched successfully', session);
  } catch (error: any) {
    sendError(res, 500, 'Failed to fetch session', error.message);
  }
};

// Update session by ID
export const updateSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const sessionRepository = queryRunner.manager.getRepository(Session);
      const session = await sessionRepository.findOne({
        where: { id: +id },
      });
      if (!session) {
        sendError(res, 404, 'Session not found', 'Session not found');
        return;
      }
      sessionRepository.merge(session, req.body);
      const updatedSession = await sessionRepository.save(session);
      sendResponse(res, 200, 'Session updated successfully', updatedSession);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to update session', error.message);
  }
};

// Delete session by ID
export const deleteSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const sessionRepository = queryRunner.manager.getRepository(Session);
      const session = await sessionRepository.findOne({
        where: { id: +id },
      });
      if (!session) {
        sendError(res, 404, 'Session not found', 'Session not found');
        return;
      }

      session.is_active = false;
      await sessionRepository.save(session);

      sendResponse(res, 204, 'Session deleted successfully', null);
    });
  } catch (error: any) {
    sendError(res, 500, 'Failed to delete session', error.message);
  }
};

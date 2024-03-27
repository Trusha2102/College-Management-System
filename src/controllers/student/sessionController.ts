import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Session } from '../../entity/Session';

// Create a new session
export const createSession = async (req: Request, res: Response) => {
  try {
    const sessionRepository = AppDataSource.getRepository(Session);
    const newSession = sessionRepository.create(req.body);
    await sessionRepository.save(newSession);
    res.status(201).json(newSession);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create session' });
  }
};

// Get all sessions
export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessionRepository = AppDataSource.getRepository(Session);
    const sessions = await sessionRepository.find();
    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
};

// Get session by ID
export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionRepository = AppDataSource.getRepository(Session);
    const session = await sessionRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch session' });
  }
};

// Update session by ID
export const updateSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionRepository = AppDataSource.getRepository(Session);
    const session = await sessionRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    sessionRepository.merge(session, req.body);
    const updatedSession = await sessionRepository.save(session);
    res.status(200).json(updatedSession);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update session' });
  }
};

// Delete session by ID
export const deleteSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionRepository = AppDataSource.getRepository(Session);
    const session = await sessionRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.is_active = false;
    await sessionRepository.save(session);

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete session' });
  }
};

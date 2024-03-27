import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Module } from '../../entity/Module';
import { sendResponse, sendError } from '../../utils/commonResponse';

const createModule = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const module = AppDataSource.manager.create(Module, { name });
    await AppDataSource.manager.save(module);
    sendResponse(res, 201, 'Module', module);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to create module', null);
  }
};

const getAllModules = async (req: Request, res: Response) => {
  try {
    const modules = await AppDataSource.manager.find(Module);
    sendResponse(res, 200, 'Modules', modules);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch modules', null);
  }
};

const getModuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const module = await AppDataSource.manager.findOne(Module, {
      where: { id: parseInt(id) },
    });
    sendResponse(res, 200, 'Module', module);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch module', null);
  }
};

const updateModuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await AppDataSource.manager.update(Module, id, { name });
    const updatedModule = await AppDataSource.manager.findOne(Module, {
      where: { id: parseInt(id) },
    });
    sendResponse(res, 200, 'Module', updatedModule);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update module', null);
  }
};

const deleteModuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AppDataSource.manager.delete(Module, id);
    res.status(200).end();
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to delete module', null);
  }
};

export {
  createModule,
  getAllModules,
  getModuleById,
  updateModuleById,
  deleteModuleById,
};

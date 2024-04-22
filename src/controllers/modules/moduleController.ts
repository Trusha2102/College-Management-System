import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Module } from '../../entity/Module';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';

const createModule = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const module = queryRunner.manager.create(Module, { name });
      await queryRunner.manager.save(module);
      sendResponse(res, 201, 'Module', module);
    });
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
      where: { id: +id },
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

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      await queryRunner.manager.update(Module, id, { name });
      const updatedModule = await queryRunner.manager.findOne(Module, {
        where: { id: +id },
      });
      sendResponse(res, 200, 'Module', updatedModule);
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update module', null);
  }
};

const deleteModuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    const moduleRepository = queryRunner.manager.getRepository(Module);

    const module = await moduleRepository.findOne({ where: { id: +id } });

    if (!module) {
      sendError(res, 404, 'Module Not Found');
      return;
    }
    await runTransaction(queryRunner, async () => {
      await moduleRepository.delete(id);

      sendResponse(res, 200, 'Module Deleted Successfully', null);
    });
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

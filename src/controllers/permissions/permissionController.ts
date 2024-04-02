import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Permission } from '../../entity/Permission';
import runTransaction from '../../utils/runTransaction';
import { sendError, sendResponse } from '../../utils/commonResponse';
import { Role } from '../../entity/Role';
import { Module } from '../../entity/Module';

const createPermission = async (req: Request, res: Response) => {
  try {
    const { roleId, moduleId, operation } = req.body;

    // Check if roleId exists in Role table
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { id: +roleId },
    });
    if (!role) {
      return sendError(res, 400, 'Role not found');
    }

    // Check if moduleId exists in Module table
    const moduleRepository = AppDataSource.getRepository(Module);
    const module = await moduleRepository.findOne({
      where: { id: +moduleId },
    });
    if (!module) {
      return sendError(res, 400, 'Module not found');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const permission = queryRunner.manager.create(Permission, {
        roleId,
        moduleId,
        operation,
      });
      await queryRunner.manager.save(permission);
      res.status(201).json(permission);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create permission' });
  }
};

const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await AppDataSource.manager.find(Permission);
    res.status(200).json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
};

const updatePermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roleId, moduleId, operation } = req.body;

    // Check if roleId exists in Role table
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { id: +roleId },
    });
    if (!role) {
      return sendError(res, 400, 'Role not found');
    }

    // Check if moduleId exists in Module table
    const moduleRepository = AppDataSource.getRepository(Module);
    const module = await moduleRepository.findOne({
      where: { id: +moduleId },
    });
    if (!module) {
      return sendError(res, 400, 'Module not found');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      await queryRunner.manager.update(Permission, +id, {
        roleId,
        moduleId,
        operation,
      });
      const updatedPermission = await queryRunner.manager.findOne(Permission, {
        where: { id: +id },
      });
      sendResponse(
        res,
        200,
        'Permission updated successfully',
        updatedPermission,
      );
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update permission');
  }
};

const deletePermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      // Check if permission exists
      const permissionRepository =
        queryRunner.manager.getRepository(Permission);
      const permission = await permissionRepository.findOne({
        where: { id: +id },
      });
      if (!permission) {
        sendError(res, 404, 'Permission not found');
        return;
      }

      await queryRunner.manager.delete(Permission, +id);
      sendResponse(res, 200, 'Permission deleted successfully');
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to delete permission');
  }
};

export {
  createPermission,
  getAllPermissions,
  updatePermissionById,
  deletePermissionById,
};

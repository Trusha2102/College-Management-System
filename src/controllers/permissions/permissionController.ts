import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Permission } from '../../entity/Permission';

const createPermission = async (req: Request, res: Response) => {
  try {
    const { roleId, moduleId, operation } = req.body;
    const permission = AppDataSource.manager.create(Permission, {
      roleId,
      moduleId,
      operation,
    });
    await AppDataSource.manager.save(permission);
    res.status(201).json(permission);
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
    await AppDataSource.manager.update(Permission, parseInt(id, 10), {
      roleId,
      moduleId,
      operation,
    });
    const updatedPermission = await AppDataSource.manager.findOne(Permission, {
      where: { id: parseInt(id, 10) },
    });
    res.status(200).json(updatedPermission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update permission' });
  }
};

const deletePermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AppDataSource.manager.delete(Permission, parseInt(id, 10));
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete permission' });
  }
};

export {
  createPermission,
  getAllPermissions,
  updatePermissionById,
  deletePermissionById,
};

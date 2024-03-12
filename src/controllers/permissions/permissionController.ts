import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createPermission = async (req: Request, res: Response) => {
  try {
    const {
      roleId,
      moduleId,
      read_permission,
      write_permission,
      update_permission,
      delete_permission
    } = req.body;
    const permission = await prisma.permission.create({
      data: {
        roleId,
        moduleId,
        read_permission,
        write_permission,
        update_permission,
        delete_permission
      }
    });
    res.status(201).json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create permission' });
  }
};

const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.status(200).json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
};

const getPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permission = await prisma.permission.findUnique({
      where: { id: parseInt(id) }
    });
    res.status(200).json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch permission' });
  }
};

const updatePermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      roleId,
      moduleId,
      read_permission,
      write_permission,
      update_permission,
      delete_permission
    } = req.body;
    const permission = await prisma.permission.update({
      where: { id: parseInt(id) },
      data: {
        roleId,
        moduleId,
        read_permission,
        write_permission,
        update_permission,
        delete_permission
      }
    });
    res.status(200).json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update permission' });
  }
};

const deletePermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.permission.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete permission' });
  }
};

export {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermissionById,
  deletePermissionById
};

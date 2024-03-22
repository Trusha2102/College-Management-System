import { Request, Response } from 'express';
import { Role } from '../../entity/Role';
import { sendResponse, sendError } from '../../utils/commonResponse';
import AppDataSource from '../../data-source';

const createRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const role = AppDataSource.manager.create(Role, {
      name: name,
    });
    await AppDataSource.manager.save(role);

    sendResponse(res, 200, 'Role', role);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to create role', null);
  }
};

const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await AppDataSource.manager.find(Role);
    sendResponse(res, 200, 'Role', roles);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch roles', null);
  }
};

const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await AppDataSource.manager.findOne(Role, {
      where: { id: parseInt(id, 10) },
    });
    sendResponse(res, 200, 'Role', role);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch role', null);
  }
};

const updateRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await AppDataSource.manager.update(Role, id, { name });
    const updatedRole = await AppDataSource.manager.findOne(Role, {
      where: { id: parseInt(id, 10) },
    });
    sendResponse(res, 200, 'Role', updatedRole);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update role', null);
  }
};

const deleteRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AppDataSource.manager.delete(Role, parseInt(id, 10));
    res.status(200).end();
    sendResponse(res, 200, 'Role Deleted Successfully!', null);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to delete the role', null);
  }
};

export { createRole, getAllRoles, getRoleById, updateRoleById, deleteRoleById };

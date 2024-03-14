import { Request, Response } from 'express';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const role = await prisma.role.create({
      data: { name }
    });
    sendResponse(res, 200, 'Role', role);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to create role', null);
  }
};

const getAllRoles = async (req: Request, res: Response) => {
  try {
    console.log('THIS IS FROM THE TOKEN:');
    const roles = await prisma.role.findMany();
    sendResponse(res, 200, 'Role', roles);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch roles', null);
  }
};

const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) }
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
    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    sendResponse(res, 200, 'Role', role);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update role', null);
  }
};

const deleteRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).end();
    sendResponse(res, 200, 'Role Deleted Successfully!', null);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to delete the role', null);
  }
};

export { createRole, getAllRoles, getRoleById, updateRoleById, deleteRoleById };

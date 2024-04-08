import { Request, Response } from 'express';
import { Role } from '../../entity/Role';
import { sendResponse, sendError } from '../../utils/commonResponse';
import AppDataSource from '../../data-source';
import runTransaction from '../../utils/runTransaction';

const createRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const normalizedName = name.trim().toLowerCase();

    const roleRepository = AppDataSource.getRepository(Role);
    const existingRole = await roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) ILIKE LOWER(:name)', {
        name: `%${normalizedName}%`,
      })
      .getOne();

    if (existingRole) {
      sendError(res, 400, 'Role with a similar name already exists', null);
      return;
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const role = queryRunner.manager.create(Role, { name: normalizedName });
      await queryRunner.manager.save(role);
      sendResponse(res, 200, 'Role', role);
    });
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
      where: { id: +id },
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

    const normalizedName = name.trim().toLowerCase();

    const roleRepository = AppDataSource.getRepository(Role);
    const existingRole = await roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) ILIKE LOWER(:name) AND role.id != :id', {
        name: `%${normalizedName}%`,
        id,
      })
      .getOne();

    if (existingRole) {
      sendError(res, 400, 'Role with the same name already exists', null);
      return;
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      await queryRunner.manager.update(Role, id, { name: normalizedName });
      const updatedRole = await queryRunner.manager.findOne(Role, {
        where: { id: +id },
      });
      sendResponse(res, 200, 'Role', updatedRole);
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update role', null);
  }
};

const deleteRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      await queryRunner.manager.delete(Role, +id);
      sendResponse(res, 200, 'Role Deleted Successfully!', null);
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to delete the role', null);
  }
};

export { createRole, getAllRoles, getRoleById, updateRoleById, deleteRoleById };

import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Permission } from '../../entity/Permission';
import runTransaction from '../../utils/runTransaction';
import { sendError, sendResponse } from '../../utils/commonResponse';
import { Role } from '../../entity/Role';
import { Module } from '../../entity/Module';
import CasbinService from '../../casbin/enforcer';
const casbin = new CasbinService();

const createPermission = async (req: Request, res: Response) => {
  try {
    const { role: roleName, permission: permissionsData } = req.body;

    const normalizedRoleName = roleName.trim().toLowerCase();

    // Check if role exists
    const roleRepository = AppDataSource.getRepository(Role);
    let role = await roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) ILIKE LOWER(:name)', {
        name: `%${normalizedRoleName}%`,
      })
      .getOne();

    if (!role) {
      // If role doesn't exist, create a new one
      role = roleRepository.create({ name: normalizedRoleName });
      await roleRepository.save(role);
    } else {
      // If role with the similar name exists, throw an error
      return sendError(res, 400, `Role '${normalizedRoleName}' already exists`);
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const createdPermissions = [];
      for (const permissionData of permissionsData) {
        const { moduleId, operation } = permissionData;

        // Check if module exists
        const moduleRepository = AppDataSource.getRepository(Module);
        const module = await moduleRepository.findOne({
          where: { id: moduleId },
        });
        if (!module) {
          sendError(res, 400, `Module with ID ${moduleId} not found`);
          return;
        }

        // Create a permission record for each operation
        for (const op of operation) {
          const permissionRecord = queryRunner.manager.create(Permission, {
            roleId: role.id,
            moduleId,
            operation: op,
          });
          await queryRunner.manager.save(permissionRecord);
          createdPermissions.push(permissionRecord);
        }

        // Add policy to casbin enforcer
        const enforcer = await casbin.getEnforcer();

        await enforcer.addPolicy(role.name, module.name, operation);
      }
      res.status(201).json(createdPermissions);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create permissions' });
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
    const findPermission = await AppDataSource.manager.findOne(Permission, {
      where: { id: +id },
      relations: ['role', 'module'],
    });
    await AppDataSource.manager.update(Permission, parseInt(id, 10), {
      roleId,
      moduleId,
      operation,
    });

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
      const findRole = await AppDataSource.manager.findOne(Role, {
        where: { id: roleId },
      });

      const findModule = await AppDataSource.manager.findOne(Module, {
        where: { id: moduleId },
      });

      const enforcer = await casbin.getEnforcer();
      if (findModule?.name && findRole?.name) {
        const findPolicy = await enforcer.getFilteredPolicy(
          0,
          findPermission?.role?.name as string,
          findPermission?.module?.name as string,
          findPermission?.operation as string,
        );
        if (findPolicy) {
          await enforcer.updatePolicy(
            [
              findPermission?.role?.name as string,
              findPermission?.module?.name as string,
              findPermission?.operation as string,
            ],
            [findRole?.name, findModule?.name, operation],
          );
        } else {
          await enforcer.addPolicy(findRole?.name, findModule?.name, operation);
        }
      }
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

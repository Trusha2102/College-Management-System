import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import { Permission } from '../../entity/Permission';
import runTransaction from '../../utils/runTransaction';
import { sendError, sendResponse } from '../../utils/commonResponse';
import { Role } from '../../entity/Role';
import { Module } from '../../entity/Module';
import { CasbinService } from '../../casbin/enforcer';
import { In, Not } from 'typeorm';
const casbinService = new CasbinService();

const createPermission = async (req: Request, res: Response) => {
  const casbin = await casbinService.getEnforcer();

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
            roleId: role?.id,
            moduleId,
            operation: op,
          });
          await queryRunner.manager.save(permissionRecord);
          createdPermissions.push(permissionRecord);
        }

        await casbin.addPolicy(role?.name as string, module?.name, operation);
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
  const casbin = await casbinService.getEnforcer();

  try {
    const { id } = req.params;
    const { roleId, permission } = req.body;

    // Check if roleId exists in Role table
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { id: +roleId },
    });
    if (!role) {
      return sendError(res, 400, 'Role not found');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      for (const perm of permission) {
        const { moduleId, operations } = perm;

        // Check if moduleId exists in Module table
        const moduleRepository = AppDataSource.getRepository(Module);
        const module = await moduleRepository.findOne({
          where: { id: moduleId },
        });
        if (!module) {
          sendError(res, 400, 'Module not found');
          return;
        }

        for (const operation of operations) {
          const existingPermission = await AppDataSource.manager.findOne(
            Permission,
            {
              where: {
                roleId: +roleId,
                moduleId: +moduleId,
                operation: operation,
              },
            },
          );

          if (!existingPermission) {
            // Create new permission if it doesn't exist
            await queryRunner.manager.insert(Permission, {
              roleId: +roleId,
              moduleId: +moduleId,
              operation: operation,
            });

            // Add policy to Casbin
            await casbin.addPolicy(role.name, module.name, operation);
          }
        }

        // Delete permissions not found in the update object
        await queryRunner.manager.delete(Permission, {
          roleId: +roleId,
          moduleId: +moduleId,
          operation: Not(In(operations)),
        });

        // Remove policies not found in the update object from Casbin
        const existingPolicies = await casbin.getFilteredPolicy(
          0,
          role.name,
          module.name,
        );
        const existingOperations = existingPolicies.map((policy) => policy[2]);
        const operationsToDelete = existingOperations.filter(
          (op) => !operations.includes(op),
        );
        operationsToDelete.forEach(async (op: string) => {
          await casbin.removePolicy(role.name, module.name, op);
        });
      }
    });

    sendResponse(res, 200, 'Permissions updated successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update permissions');
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

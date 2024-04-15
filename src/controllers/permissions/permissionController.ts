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

interface GroupedPermissions {
  [moduleId: number]: { module_name: string; operations: string[] };
}

const createPermission = async (req: Request, res: Response) => {
  const casbin = await casbinService.getEnforcer();

  try {
    const { role: roleName, permissions: permissionsData } = req.body;

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
        const { moduleId, operations } = permissionData;

        // Check if module exists
        const moduleRepository = AppDataSource.getRepository(Module);
        const module = await moduleRepository.findOne({
          where: { id: moduleId },
        });
        if (!module) {
          sendError(res, 400, `Module with ID ${moduleId} not found`);
          return;
        }

        const operation = operations || [''];

        // Create a permission record for each operation
        for (const op of operation) {
          const permissionRecord = queryRunner.manager.create(Permission, {
            roleId: role?.id,
            moduleId,
            operation: op,
          });
          await queryRunner.manager.save(permissionRecord);
          await casbin.addPolicy(role?.name as string, module?.name, op);
          createdPermissions.push(permissionRecord);
        }
      }

      sendResponse(res, 201, 'Permission Created Successfully');
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
  let errorOccurred = false;

  try {
    const { roleId, role: roleName, permissions } = req.body;

    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { id: +roleId },
    });

    if (!role) {
      sendError(res, 400, 'Role not found');
      errorOccurred = true;
      return;
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      if (roleName) {
        role.name = roleName;
        await roleRepository.save(role);
      }

      for (const perm of permissions) {
        const { moduleId, operations } = perm;

        const moduleRepository = AppDataSource.getRepository(Module);
        const module = await moduleRepository.findOne({
          where: { id: moduleId },
        });

        if (!module) {
          sendError(res, 400, 'Module not found');
          errorOccurred = true;
          return;
        }

        await casbin.removeFilteredPolicy(0, role.name, module.name);

        for (const operation of operations) {
          await casbin.addPolicy(role.name, module.name, operation);
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
            await queryRunner.manager.insert(Permission, {
              roleId: +roleId,
              moduleId: +moduleId,
              operation: operation,
            });
          }
        }

        await queryRunner.manager.delete(Permission, {
          roleId: +roleId,
          moduleId: +moduleId,
          operation: Not(In(operations)),
        });
      }
    });

    if (!errorOccurred) {
      sendResponse(res, 200, 'Permissions updated successfully');
    }
  } catch (error) {
    console.error(error);
    if (!errorOccurred) {
      sendError(res, 500, 'Failed to update permissions');
    }
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

const generatePermissionsHTML = async (req: Request, res: Response) => {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);
    const permissions = await permissionRepository.find();

    // Group permissions by roleId and moduleId
    const groupedPermissions: { [key: string]: Permission } = {};
    permissions.forEach((permission: Permission) => {
      const key = `${permission.roleId}-${permission.moduleId}`;
      if (!(key in groupedPermissions)) {
        groupedPermissions[key] = permission;
      }
    });

    let htmlContent =
      '<html><head><title>Permissions</title></head><body><h1>Permissions</h1><table><tr><th>Role Name</th><th>Module Name</th><th>Write</th><th>Read</th><th>Edit</th><th>Delete</th></tr>';

    // Generate HTML rows
    for (const groupedPermission of Object.values(groupedPermissions)) {
      const { roleId, moduleId } = groupedPermission;

      // Fetch role name
      const role = await AppDataSource.getRepository(Role).findOne({
        where: { id: roleId },
      });
      const roleName = role ? role.name : 'Unknown Role';

      // Fetch module name
      const module = await AppDataSource.getRepository(Module).findOne({
        where: { id: moduleId },
      });
      const moduleName = module ? module.name : 'Unknown Module';

      let writeColor = 'red';
      let readColor = 'red';
      let editColor = 'red';
      let deleteColor = 'red';

      permissions.forEach((perm: Permission) => {
        if (perm.roleId === roleId && perm.moduleId === moduleId) {
          if (perm.operation === 'write') {
            writeColor = 'green';
          } else if (perm.operation === 'read') {
            readColor = 'green';
          } else if (perm.operation === 'edit') {
            editColor = 'green';
          } else if (perm.operation === 'delete') {
            deleteColor = 'green';
          }
        }
      });

      htmlContent += `<tr><td>${roleName}</td><td>${moduleName}</td><td style="background-color:${writeColor}">${writeColor === 'green' ? 'Yes' : 'No'}</td><td style="background-color:${readColor}">${readColor === 'green' ? 'Yes' : 'No'}</td><td style="background-color:${editColor}">${editColor === 'green' ? 'Yes' : 'No'}</td><td style="background-color:${deleteColor}">${deleteColor === 'green' ? 'Yes' : 'No'}</td></tr>`;
    }

    htmlContent += '</table></body></html>';

    res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Failed to generate permissions HTML:', error);
    res.status(500).send('Failed to generate permissions HTML');
  }
};

export const getPermissionByRoleID = async (req: Request, res: Response) => {
  try {
    const roleId = req.params.roleId;

    // Fetch role data
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({ where: { id: +roleId } });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const permissionRepository = AppDataSource.getRepository(Permission);
    const permissions = await permissionRepository.find({
      where: { roleId: +roleId },
    });

    const groupedPermissions: GroupedPermissions = {};
    for (const permission of permissions) {
      const { moduleId, operation } = permission;

      const moduleRepository = AppDataSource.getRepository(Module);
      const module = await moduleRepository.findOne({
        where: { id: moduleId },
      });

      if (module) {
        if (!groupedPermissions[moduleId]) {
          groupedPermissions[moduleId] = {
            module_name: module.name,
            operations: [],
          };
        }
        groupedPermissions[moduleId].operations.push(operation);
      }
    }

    const formattedPermissions = [];
    for (const moduleId in groupedPermissions) {
      const { module_name, operations } = groupedPermissions[moduleId];
      formattedPermissions.push({
        moduleId: parseInt(moduleId),
        module_name,
        operations,
      });
    }

    sendResponse(res, 200, 'Permission Fetched Successfully', {
      role: role.name,
      permissions: formattedPermissions,
    });

    // res
    //   .status(200)
    //   .json({ role: role.name, permissions: formattedPermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
};

export {
  createPermission,
  getAllPermissions,
  updatePermissionById,
  deletePermissionById,
  generatePermissionsHTML,
};

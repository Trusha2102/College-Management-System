import { NextFunction, Request, Response } from 'express';
import { sendResponse, sendError } from '../utils/commonResponse';
import { User } from '../entity/User';
import { Role } from '../entity/Role';
import AppDataSource from '../data-source';
import * as jwt from 'jsonwebtoken';
import { routeAction } from '../utils/routeActions';
import { CasbinService } from '../casbin/enforcer';
const casbinService = new CasbinService();

const permissionProtect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | null = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(sendError(res, 401, 'Not authorized to access this route'));
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded || !decoded?.user) {
      return next(sendError(res, 401, 'Not authorized to access this route'));
    }
    console.log(decoded.user.role_id, 'This is user role id');
    const roleRepository = await AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { id: decoded.user.role_id },
    });
    if (!role) {
      console.log('role Not found');
      return next(sendError(res, 401, 'Not authorized to access this route'));
    }

    const parts = req.baseUrl.split('/');
    const module = parts[parts.length - 1];

    // Parse the req.url for action keywords
    let action = '';
    if (req.url.includes('add')) {
      action = 'write';
    } else if (req.url.includes('update')) {
      action = 'edit';
    } else if (req.url.includes('delete')) {
      action = 'delete';
    } else if (req.url.includes('list') || req.url.includes('view')) {
      action = 'read';
    }

    console.log(role.name, module, action);
    const casbin = await casbinService.getEnforcer();
    const status = await casbin.enforce(role.name, module, action);
    console.log('🚀 ~ status:', status);
    if (!status) {
      return next(sendError(res, 401, 'Not authorized to access this route'));
    }
    req.user = decoded?.user;

    next();
  } catch (err) {
    console.log('Casbin Error:::::', err);
    next(sendError(res, 500, 'Internal server error'));
  }
};

export default permissionProtect;

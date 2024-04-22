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
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { id: decoded.user.role_id },
    });
    if (!role) {
      return next(sendError(res, 401, 'Not authorized to access this route'));
    }
    const casbin = await casbinService.getEnforcer();

    const parts = req.baseUrl.split('/');
    console.log('🚀 ~ parts:', parts);
    const module = parts[parts.length - 1];
    console.log('🚀 ~ module:', module);

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

    console.log('🚀 ~ action:', action);

    const status = await casbin.enforce(role.name, module, action);
    console.log('🚀 ~ status:', status);
    if (!status) {
      return next(sendError(res, 401, 'Not authorized to access this route'));
    }
    req.user = decoded?.user;

    next();
  } catch (err) {
    next(sendError(res, 500, 'Internal server error'));
  }
};

export default permissionProtect;

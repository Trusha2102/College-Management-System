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
    const module = parts[parts.length - 1];
    let route = '';

    if (req.url.split('/').length > 2) {
      const lastSlashIndex = req.url.lastIndexOf('/');
      route = req.url.substring(1, lastSlashIndex);
    } else {
      route = req.url.replace('/', '');
    }
    //@ts-ignore
    const action = routeAction[`${route}`];
    const status = await casbin.enforce(role.name, module, action);
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

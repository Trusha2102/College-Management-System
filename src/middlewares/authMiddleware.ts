// import { Request, Response, NextFunction } from 'express';
// import { getEnforcer } from '../casbin/enforcer';

// export async function casbinAuthorization(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   const enforcer = await getEnforcer(req.dbConnection); // Assuming dbConnection is your TypeORM connection
//   const { user, originalUrl, method } = req;

//   const [module] = originalUrl.split('/').slice(2); // Extract module name from URL
//   const [_, _, operation] = method.toLowerCase().split('_'); // Extract operation from method

//   const allowed = await enforcer.enforce(
//     user.role_id.toString(),
//     module,
//     operation,
//   );
//   if (!allowed) {
//     return res.status(403).json({ error: 'Unauthorized' });
//   }

//   next();
// }

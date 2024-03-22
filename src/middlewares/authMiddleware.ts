// import { Request, Response, NextFunction } from 'express';
// import { Prisma, PrismaClient } from '@prisma/client';
// import CasbinRule from '../casbin/casbin.enforcer'; // Assuming this is the correct path to your CasbinRule class

// const prisma = new PrismaClient();

// export const authorizationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const role_id = parseInt(String(req.user?.role_id || '0'), 10); // Convert role_id to a number, defaulting to '0' if undefined
//     console.log('🚀 ~ authorizationMiddleware ~ role_id:', role_id);
//     if (role_id === undefined) {
//       console.log('Role ID not found in request user:', req.user);
//       return res.status(403).json({ error: 'Forbidden' });
//     }

//     const module_name = extractModuleName(req.originalUrl); // Function to extract module_name from URL
//     console.log('Extracted module name:', module_name);

//     const module_id = await getModuleId(module_name); // Function to get module_id from module table using Prisma
//     console.log('Found module ID:', module_id);

//     const casbin = CasbinRule.getInstance();
//     console.log('🚀 ~ authorizationMiddleware ~ req:', req.method.toLowerCase());

//     const something = await casbin.getAllPolicies();
//     console.log('THE EXIISTING POLICIES:', something);

//     // // Define the parameters for the policy
//     const sec = ''; // Specify the section if needed
//     const ptype = 'p'; // Policy type
//     const rule = ['1', '1', 'get']; // Rule array with roleId, moduleId, and operation

//     const something2 = await casbin.addPolicy(sec, ptype, rule);
//     console.log('THE POLICY THAT WE CREATED:', something2);

//     const isAllowed = await casbin.checkPermission(role_id, module_id, req.method.toLowerCase());
//     console.log('Permission check result:', isAllowed);

//     if (!isAllowed) {
//       return res.status(403).json({ error: 'Forbidden' });
//     }

//     next();
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // Function to extract module_name from URL
// const extractModuleName = (url: string): string => {
//   const parts = url.split('/').filter(Boolean);
//   const moduleIndex = parts.findIndex((part) => part === 'api') + 1;
//   if (moduleIndex >= parts.length) {
//     throw new Error('Invalid URL format');
//   }
//   return parts[moduleIndex];
// };

// // Function to get module_id from module table using Prisma
// const getModuleId = async (module_name: string): Promise<number> => {
//   const module = await prisma.module.findFirst({
//     where: {
//       name: module_name
//     } as Prisma.ModuleWhereUniqueInput
//   });
//   if (!module) {
//     throw new Error('Module not found');
//   }
//   return module.id;
// };

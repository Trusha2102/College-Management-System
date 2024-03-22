// export default class PermissionRepository {
//   constructor() {}

//   savePolicy(model: Model): Promise<boolean> {
//     throw new Error('Method not implemented.');
//   }

//   async loadPolicy(model: Model): Promise<void> {
//     const permissions = await prisma.permission.findMany();
//     for (const perm of permissions) {
//       model.addPolicy(perm.roleId.toString(), perm.moduleId.toString(), [perm.operation]);
//     }
//   }

//   async addPolicy(sec: string, ptype: string, rule: string[]): Promise<void> {
//     try {
//       await prisma.permission.create({
//         data: {
//           roleId: parseInt(rule[0]),
//           moduleId: parseInt(rule[1]),
//           operation: rule[2]
//         }
//       });
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }

//   async removePolicy(sec: string, ptype: string, rule: string[]): Promise<void> {
//     try {
//       await prisma.permission.deleteMany({
//         where: {
//           roleId: parseInt(rule[0]),
//           moduleId: parseInt(rule[1]),
//           operation: rule[2]
//         }
//       });
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }

//   async removeFilteredPolicy(
//     sec: string,
//     ptype: string,
//     fieldIndex: number,
//     ...fieldValues: string[]
//   ): Promise<void> {
//     const where: any = {};
//     where[`v${fieldIndex}`] = fieldValues[0];

//     try {
//       await prisma.permission.deleteMany({
//         where
//       });
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }
// }

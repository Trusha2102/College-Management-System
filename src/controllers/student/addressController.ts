// import { Request, Response } from 'express';
// import AppDataSource from '../../data-source';
// import { Address } from '../../entity/Address';
// import { sendError, sendResponse } from '../../utils/commonResponse';
// import runTransaction from '../../utils/runTransaction';
// import { Student } from '../../entity/Student';
// import { User } from '../../entity/User';

// // Create a new address
// export const createAddress = async (req: Request, res: Response) => {
//   try {
//     let { student_id, user_id } = req.body;
//     student_id = student_id ? +student_id : null;
//     user_id = user_id ? +user_id : null;

//     const queryRunner = AppDataSource.createQueryRunner();
//     await runTransaction(queryRunner, async () => {
//       const studentRepository = queryRunner.manager.getRepository(Student);
//       const userRepository = queryRunner.manager.getRepository(User);

//       let existingStudent = null;
//       if (student_id !== null) {
//         existingStudent = await studentRepository.findOne({
//           where: { id: student_id },
//         });
//         if (!existingStudent) {
//           sendError(res, 404, 'Student not found');
//           return;
//         }
//       }

//       let existingUser = null;
//       if (user_id !== null) {
//         existingUser = await userRepository.findOne({ where: { id: user_id } });
//         if (!existingUser) {
//           sendError(res, 404, 'User not found');
//           return;
//         }
//       }

//       const addressRepository = queryRunner.manager.getRepository(Address);

//       const newAddress = addressRepository.create({
//         ...req.body,
//         student_id,
//         user_id,
//         student: existingStudent || null,
//         user: existingUser || null,
//       });

//       await addressRepository.save(newAddress);

//       sendResponse(res, 201, 'Address created successfully', newAddress);
//     });
//   } catch (error: any) {
//     sendError(res, 500, 'Failed to create address', error.message);
//   }
// };

// // Update address by ID
// export const updateAddressById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const queryRunner = AppDataSource.createQueryRunner();
//     await runTransaction(queryRunner, async () => {
//       const addressRepository = queryRunner.manager.getRepository(Address);
//       const address = await addressRepository.findOne({
//         where: { id: +id },
//       });

//       if (!address) {
//         sendError(res, 404, 'Address not found');
//         return;
//       }

//       const studentRepository = queryRunner.manager.getRepository(Student);
//       const userRepository = queryRunner.manager.getRepository(User);

//       let existingStudent: Student | null = null;
//       let existingUser: User | null = null;

//       if (req.body.student_id) {
//         existingStudent = await studentRepository.findOne(req.body.student_id);
//         if (!existingStudent) {
//           sendError(res, 404, 'Student not found');
//           return;
//         }
//       }

//       if (req.body.user_id) {
//         existingUser = await userRepository.findOne(req.body.user_id);
//         if (!existingUser) {
//           sendError(res, 404, 'User not found');
//           return;
//         }
//       }
//       // Update only the fields that are present in req.body
//       Object.assign(address, {
//         ...req.body,
//         student: existingStudent || address.student,
//         user: existingUser || address.user,
//       });

//       await addressRepository.save(address);

//       sendResponse(res, 200, 'Address updated successfully', address);
//     });
//   } catch (error: any) {
//     sendError(res, 500, 'Failed to update address', error.message);
//   }
// };

// // Delete address by ID
// export const deleteAddressById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const queryRunner = AppDataSource.createQueryRunner();
//     await runTransaction(queryRunner, async () => {
//       const addressRepository = queryRunner.manager.getRepository(Address);
//       await addressRepository.delete(+id);
//       sendResponse(res, 200, 'Address deleted successfully', null);
//     });
//   } catch (error: any) {
//     sendError(res, 500, 'Failed to delete address', error.message);
//   }
// };

// // Get address by ID
// export const getAddressById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const addressRepository = AppDataSource.getRepository(Address);
//     const address = await addressRepository.findOne({
//       where: { id: +id },
//     });

//     if (!address) {
//       return sendError(res, 404, 'Address not found');
//     }

//     sendResponse(res, 200, 'Success', address);
//   } catch (error: any) {
//     sendError(res, 500, 'Failed to fetch address', error.message);
//   }
// };

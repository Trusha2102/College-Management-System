import { Request, Response } from 'express';
import configureMulter from '../../utils/multerConfig';

const upload = configureMulter('./uploads/Student', 5 * 1024 * 1024); // 5MB limit

const createStudent = async (req: Request, res: Response) => {
  // try {
  //   upload.fields([
  //     { name: 'profile_picture', maxCount: 1 },
  //     { name: 'other_docs', maxCount: 5 }
  //   ])(req, res, async (err: any) => {
  //     if (err) {
  //       console.error(err);
  //       return res.status(500).json({ message: 'Failed to upload files' });
  //     }
  //     const { body, files } = req;
  //     // Process other_docs files
  //     const otherDocsFiles =
  //       (files as { [fieldname: string]: Express.Multer.File[] })['other_docs'] || [];
  //     const otherDocs = otherDocsFiles.map((file) => ({
  //       name: file.originalname,
  //       path: file.path
  //     }));
  //     // Create the student with the provided data and file paths
  //     const student = await prisma.student.create({
  //       data: {
  //         ...body,
  //         profile_picture:
  //           (files as { [fieldname: string]: Express.Multer.File[] })['profile_picture']?.[0]
  //             ?.path || '',
  //         other_docs: { create: otherDocs }
  //       }
  //     });
  //     res.status(201).json(student);
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: 'Failed to create student' });
  // }
};

export default createStudent;

const getStudentById = async (req: Request, res: Response) => {
  // try {
  //   const { id } = req.params;
  //   const student = await prisma.student.findUnique({
  //     where: { id: parseInt(id) },
  //     include: {
  //       address: true,
  //       parent_details: true,
  //       bank_details: true,
  //       result: true,
  //       fees_payment: true,
  //       fees_master: true
  //     }
  //   });
  //   if (!student) {
  //     return res.status(404).json({ message: 'Student not found' });
  //   }
  //   res.json(student);
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: 'Failed to fetch student' });
  // }
};

const updateStudentById = async (req: Request, res: Response) => {
  // try {
  //   upload.fields([
  //     { name: 'profile_picture', maxCount: 1 },
  //     { name: 'other_docs', maxCount: 5 }
  //   ])(req, res, async (err: any) => {
  //     if (err) {
  //       console.error(err);
  //       return res.status(500).json({ message: 'Failed to upload files' });
  //     }
  //     const { id } = req.params;
  //     const { body, files } = req;
  //     // Process other_docs files
  //     const otherDocsFiles =
  //       (files as { [fieldname: string]: Express.Multer.File[] })['other_docs'] || [];
  //     const otherDocs = otherDocsFiles.map((file: any) => ({
  //       name: file.originalname,
  //       path: file.path
  //     }));
  //     const updatedStudent = await prisma.student.update({
  //       where: { id: parseInt(id) },
  //       data: {
  //         ...body,
  //         profile_picture:
  //           (files as { [fieldname: string]: Express.Multer.File[] })['profile_picture']?.[0]
  //             ?.path || '',
  //         other_docs: { createMany: { data: otherDocs } }
  //       }
  //     });
  //     res.json(updatedStudent);
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: 'Failed to update student' });
  // }
};

const deleteStudentById = async (req: Request, res: Response) => {
  // try {
  //   const { id } = req.params;
  //   await prisma.student.delete({
  //     where: { id: parseInt(id) }
  //   });
  //   res.json({ message: 'Student deleted successfully' });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: 'Failed to delete student' });
  // }
};

export { createStudent, getStudentById, updateStudentById, deleteStudentById };

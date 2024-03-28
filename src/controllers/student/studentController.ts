import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import configureMulter from '../../utils/multerConfig';
import { Student } from '../../entity/Student';
import bcrypt from 'bcrypt';
import { sendError, sendResponse } from '../../utils/commonResponse';

const upload = configureMulter('./uploads/Student', 5 * 1024 * 1024); // 5MB limit

const createStudent = async (req: Request, res: Response) => {
  try {
    upload.fields([
      { name: 'profile_picture', maxCount: 1 },
      { name: 'other_docs', maxCount: 5 },
    ])(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        return sendError(res, 500, 'Failed to upload files', err.message);
      }
      const { body, files } = req;
      // Process other_docs files
      const otherDocsFiles =
        (files as { [fieldname: string]: Express.Multer.File[] })[
          'other_docs'
        ] || [];
      const otherDocs = otherDocsFiles.map((file) => ({
        name: file.originalname,
        path: file.path,
      }));
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      // Check if the email already exists in the Student table
      const studentRepository = AppDataSource.getRepository(Student);
      const existingStudent = await studentRepository.findOne({
        where: { email: body.email },
      });

      if (existingStudent) {
        return sendError(
          res,
          400,
          'Please add unique email',
          'Email already exists',
        );
      }

      // Create the student with the provided data and file paths
      const student = studentRepository.create({
        ...body,
        profile_picture:
          (files as { [fieldname: string]: Express.Multer.File[] })[
            'profile_picture'
          ]?.[0]?.path || '',
        other_docs: otherDocs,
        password: hashedPassword,
      });

      await studentRepository.save(student);
      sendResponse(res, 201, 'Student created successfully', student);
    });
  } catch (error: any) {
    console.error(error);
    sendError(res, 500, 'Failed to create student', error.message);
  }
};

const listStudents = async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const { name, section_name, class_name, enrollment_no, roll_no } =
      req.query;

    // Get the repository for the Student entity
    const studentRepository = AppDataSource.getRepository(Student);

    // Create the base query
    let query = studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.section', 'section')
      .leftJoinAndSelect('section.class', 'class');

    // Apply filters if provided
    if (name) {
      query = query.andWhere(
        '(student.first_name LIKE :name OR student.last_name LIKE :name OR student.middle_name LIKE :name)',
        {
          name: `%${name}%`,
        },
      );
    }
    if (section_name) {
      query = query.andWhere('section.section LIKE :section_name', {
        section_name: `%${section_name}%`,
      });
    }
    if (class_name) {
      query = query.andWhere('class.class_name LIKE :class_name', {
        class_name: `%${class_name}%`,
      });
    }
    if (enrollment_no) {
      query = query.andWhere('student.enrollment_no = :enrollment_no', {
        enrollment_no,
      });
    }
    if (roll_no) {
      query = query.andWhere('student.roll_no = :roll_no', { roll_no });
    }

    // Execute the query
    const students = await query.getMany();
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await AppDataSource.getRepository(Student).findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!student) {
      return sendError(res, 404, 'Student not found');
    }
    sendResponse(res, 200, 'Student found', student);
  } catch (error: any) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch student', error.message);
  }
};

const updateStudentById = async (req: Request, res: Response) => {
  try {
    upload.fields([
      { name: 'profile_picture', maxCount: 1 },
      { name: 'other_docs', maxCount: 5 },
    ])(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        return sendError(res, 500, 'Failed to upload files', err.message);
      }
      const { id } = req.params;
      const { body, files } = req;
      // Process other_docs files
      const otherDocsFiles =
        (files as { [fieldname: string]: Express.Multer.File[] })[
          'other_docs'
        ] || [];
      const otherDocs = otherDocsFiles.map((file: any) => ({
        name: file.originalname,
        path: file.path,
      }));
      const studentRepository = AppDataSource.getRepository(Student);
      const student = await studentRepository.findOne({
        where: { id: parseInt(id, 10) },
      });
      if (!student) {
        return sendError(res, 404, 'Student not found');
      }
      studentRepository.merge(student, {
        ...body,
        profile_picture:
          (files as { [fieldname: string]: Express.Multer.File[] })[
            'profile_picture'
          ]?.[0]?.path || '',
        other_docs: otherDocs,
      });
      const updatedStudent = await studentRepository.save(student);
      sendResponse(res, 200, 'Student updated successfully', updatedStudent);
    });
  } catch (error: any) {
    console.error(error);
    sendError(res, 500, 'Failed to update student', error.message);
  }
};

const deleteStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentRepository = AppDataSource.getRepository(Student);
    const student = await studentRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!student) {
      return sendError(res, 404, 'Student not found');
    }
    await studentRepository.delete(parseInt(id));
    sendResponse(res, 200, 'Student deleted successfully');
  } catch (error: any) {
    console.error(error);
    sendError(res, 500, 'Failed to delete student', error.message);
  }
};

export {
  createStudent,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  listStudents,
};

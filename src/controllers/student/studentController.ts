import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import configureMulter from '../../utils/multerConfig';
import { Student } from '../../entity/Student';
import bcrypt from 'bcrypt';

const upload = configureMulter('./uploads/Student', 5 * 1024 * 1024); // 5MB limit

const createStudent = async (req: Request, res: Response) => {
  try {
    upload.fields([
      { name: 'profile_picture', maxCount: 1 },
      { name: 'other_docs', maxCount: 5 },
    ])(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to upload files' });
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

      // Create the student with the provided data and file paths
      const studentRepository = AppDataSource.getRepository(Student);
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
      res.status(201).json(student);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create student' });
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

export {
  createStudent,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  listStudents,
};

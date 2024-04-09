import { Request, Response, query } from 'express';
import AppDataSource from '../../data-source';
import configureMulter from '../../utils/multerConfig';
import { Student } from '../../entity/Student';
import bcrypt from 'bcrypt';
import { sendError, sendResponse } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import { Equal, Not } from 'typeorm';
import { Session } from '../../entity/Session';
import { Semester } from '../../entity/Semester';
import { Course } from '../../entity/Course';
import { StudentHistory } from '../../entity/StudentHistory';

const upload = configureMulter('./uploads/Student', 5 * 1024 * 1024); // 5MB limit

const createStudent = async (req: Request, res: Response) => {
  let errorOccurred = false; // Flag to track if an error has occurred

  try {
    upload.fields([
      { name: 'profile_picture', maxCount: 1 },
      { name: 'other_docs', maxCount: 5 },
    ])(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        errorOccurred = true; // Set flag to true when an error occurs
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

      let student;
      const queryRunner = AppDataSource.createQueryRunner();
      await runTransaction(queryRunner, async () => {
        const studentRepository = queryRunner.manager.getRepository(Student);
        const studentHistoryRepository =
          queryRunner.manager.getRepository(StudentHistory);
        const courseRepository = queryRunner.manager.getRepository(Course);
        const semesterRepository = queryRunner.manager.getRepository(Semester);
        const sessionRepository = queryRunner.manager.getRepository(Session);

        const existingStudent = await studentRepository.findOne({
          where: { email: body.email },
        });

        // Get the course and semester
        const course = await courseRepository.findOne({
          where: { id: req.body.course_id },
        });

        if (!course) {
          sendError(res, 400, 'Invalid course ID', 'Course not found');
          errorOccurred = true;
          return;
        }

        const semester = await semesterRepository.findOne({
          where: { id: req.body.semester_id },
        });

        if (!semester) {
          sendError(res, 400, 'Invalid semester ID', 'Semester not found');
          errorOccurred = true;
          return;
        }

        const session = await sessionRepository.findOne({
          where: { id: req.body.session_id },
        });

        if (!session) {
          sendError(res, 400, 'Invalid session ID', 'Session not found');
          errorOccurred = true;
          return;
        }

        if (existingStudent) {
          sendError(
            res,
            400,
            'Please add unique email',
            'Email already exists',
          );
          errorOccurred = true;
          return;
        }

        // Check if the enrollment_no already exists in the Student table
        const existingStudentEnrollmentNo = await studentRepository.findOne({
          where: { enrollment_no: body.enrollment_no },
        });

        if (existingStudentEnrollmentNo) {
          sendError(
            res,
            400,
            'Please add unique enrollment_no',
            'Enrollment number already exists',
          );
          errorOccurred = true;
          return;
        }

        // Check if the admission_no already exists in the Student table
        const existingStudentAdmissionNo = await studentRepository.findOne({
          where: { admission_no: body.admission_no },
        });

        if (existingStudentAdmissionNo) {
          sendError(
            res,
            400,
            'Please add unique admission_no',
            'Admission number already exists',
          );
          errorOccurred = true;
          return;
        }

        // Create the student with the provided data and file paths
        student = studentRepository.create({
          ...body,
          profile_picture:
            (files as { [fieldname: string]: Express.Multer.File[] })[
              'profile_picture'
            ]?.[0]?.path || '',
          other_docs: otherDocs,
          password: hashedPassword,
          is_active: true,
        });

        await studentRepository.save(student);

        const newStudent = await studentRepository.findOne({
          where: {
            admission_no: req.body.admission_no,
          },
        });

        const newStudentId = newStudent?.id;

        if (newStudentId) {
          const studentHistory = studentHistoryRepository.create({
            student: newStudent,
            course: course,
            semester: semester,
            session: session,
          });
          await studentHistoryRepository.save(studentHistory);
        }
      });

      if (!errorOccurred) {
        // Send response only if no error has occurred
        sendResponse(res, 201, 'Student created successfully', student);
      }
    });
  } catch (error: any) {
    if (!errorOccurred) {
      // Handle error only if no error has occurred in the upload callback
      console.error(error);
      sendError(res, 500, 'Failed to create student', error.message);
    }
  }
};

const listStudents = async (req: Request, res: Response) => {
  console.log('LIST API WAS CALLED');
  try {
    // Extract query parameters and convert to numbers
    let {
      name,
      section_name,
      course_id,
      semester_id,
      enrollment_no,
      roll_no,
      page = 1,
      limit = 10,
    } = req.query;
    page = parseInt(page as string, 10);
    limit = parseInt(limit as string, 10);

    // Get the repository for the Student entity
    const studentRepository = AppDataSource.getRepository(Student);

    // Create the base query
    let query = studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.section', 'section');

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

    if (enrollment_no) {
      query = query.andWhere('student.enrollment_no = :enrollment_no', {
        enrollment_no,
      });
    }

    if (course_id) {
      query = query.andWhere('student.course_id = :course_id', {
        course_id,
      });
    }

    if (semester_id) {
      query = query.andWhere('student.semester_id = :semester_id', {
        semester_id,
      });
    }

    if (roll_no) {
      query = query.andWhere('student.roll_no = :roll_no', { roll_no });
    }

    // Apply pagination
    const totalCount = await query.getCount();
    const totalPages = Math.ceil(totalCount / limit);
    query = query.skip((page - 1) * limit).take(limit);

    // Execute the query
    const students = await query.getMany();
    res.status(200).json({ students, page, limit, totalCount, totalPages });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch students');
  }
};

const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await AppDataSource.getRepository(Student).findOne({
      where: { id: +id },
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

      const queryRunner = AppDataSource.createQueryRunner();

      let updatedStudent;
      await runTransaction(queryRunner, async () => {
        const studentRepository = queryRunner.manager.getRepository(Student);
        const student = await studentRepository.findOne({
          where: { id: +id },
        });
        if (!student) {
          sendError(res, 404, 'Student not found');
          return;
        }

        // Check for duplicate email, enrollment number, and admission number
        if (req.body.email) {
          const duplicateEmail = await studentRepository.findOne({
            where: { email: body.email, id: Not(Equal(student.id)) },
          });
          if (duplicateEmail) {
            sendError(res, 400, 'Email already exists');
            return;
          }
        }

        if (req.body.enrollment_no) {
          const duplicateEnrollmentNo = await studentRepository.findOne({
            where: {
              enrollment_no: body.enrollment_no,
              id: Not(Equal(student.id)),
            },
          });
          if (duplicateEnrollmentNo) {
            sendError(res, 400, 'Enrollment number already exists');
            return;
          }
        }

        if (req.body.admission_no) {
          const duplicateAdmissionNo = await studentRepository.findOne({
            where: {
              admission_no: body.admission_no,
              id: Not(Equal(student.id)),
            },
          });
          if (duplicateAdmissionNo) {
            sendError(res, 400, 'Admission number already exists');
            return;
          }
        }

        // Merge the updated data with existing data
        const updatedData: any = {
          ...req.body,
          profile_picture:
            (files as { [fieldname: string]: Express.Multer.File[] })[
              'profile_picture'
            ]?.[0]?.path || student.profile_picture,
          other_docs:
            (files as { [fieldname: string]: Express.Multer.File[] })[
              'other_docs'
            ]?.map((file) => ({
              name: file.originalname,
              path: file.path,
            })) || student.other_docs,
        };

        // Merge the updated data with existing data
        studentRepository.merge(student, updatedData);

        updatedStudent = await studentRepository.save(student);
      });
      if (updatedStudent) {
        sendResponse(res, 200, 'Student updated successfully', updatedStudent);
      }
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

    const queryRunner = AppDataSource.createQueryRunner();
    await runTransaction(queryRunner, async () => {
      const student = await studentRepository.findOne({
        where: { id: +id },
      });
      if (!student) {
        sendError(res, 404, 'Student not found');
        return;
      }
      await studentRepository.delete(+id);
      sendResponse(res, 200, 'Student deleted successfully');
    });
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

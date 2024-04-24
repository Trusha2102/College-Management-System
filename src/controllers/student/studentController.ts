import { Request, Response } from 'express';
import AppDataSource from '../../data-source';
import configureMulter from '../../utils/multerConfig';
import { Student } from '../../entity/Student';
import { sendError, sendResponse } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import { Equal, Not } from 'typeorm';
import { Session } from '../../entity/Session';
import { Semester } from '../../entity/Semester';
import { Course } from '../../entity/Course';
import { StudentHistory } from '../../entity/StudentHistory';
import { ParentDetails } from '../../entity/ParentDetails';
import { Section } from '../../entity/Section';
import { FeesMaster } from '../../entity/FeesMaster';
import { FeesGroup } from '../../entity/FeesGroup';

const upload = configureMulter('./uploads/Student', 200 * 1024 * 1024); // 200MB limit

const createStudent = async (req: Request, res: Response) => {
  let errorOccurred = false;

  try {
    upload.fields([
      { name: 'profile_picture', maxCount: 1 },
      { name: 'other_docs', maxCount: 5 },
    ])(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        errorOccurred = true;
        return sendError(res, 500, 'Failed to upload files', err.message);
      }

      const { body, files } = req;

      // Check if all mandatory fields are present
      const mandatoryFields = [
        'admission_no',
        'course_id',
        'semester_id',
        'section_id',
        'session_id',
        'first_name',
        'gender',
        'dob',
        'email',
      ];
      const missingFields = mandatoryFields.filter((field) => !(field in body));

      if (missingFields.length > 0) {
        return sendError(
          res,
          400,
          'Mandatory fields missing',
          `The following fields are required: ${missingFields.join(', ')}`,
        );
      }

      //@ts-ignore
      const otherDocsFiles = files?.other_docs || [];
      const otherDocs = otherDocsFiles.map((file: any) => ({
        name: file.originalname,
        path: file.path,
      }));
      const otherDocsJsonString = JSON.stringify(otherDocs);

      let student;
      let parentDetails;
      let newStudent;
      let newFeesMaster;

      const queryRunner = AppDataSource.createQueryRunner();
      await runTransaction(queryRunner, async () => {
        const studentRepository = queryRunner.manager.getRepository(Student);
        const studentHistoryRepository =
          queryRunner.manager.getRepository(StudentHistory);
        const courseRepository = queryRunner.manager.getRepository(Course);
        const semesterRepository = queryRunner.manager.getRepository(Semester);
        const sessionRepository = queryRunner.manager.getRepository(Session);
        const sectionRepository = queryRunner.manager.getRepository(Section);
        const parentDetailsRepository =
          queryRunner.manager.getRepository(ParentDetails);
        const feesMasterRepository =
          queryRunner.manager.getRepository(FeesMaster);
        const feesGroupRepository =
          queryRunner.manager.getRepository(FeesGroup);

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

        const section = await sectionRepository.findOne({
          where: { id: req.body.section_id },
        });

        if (!section) {
          sendError(res, 400, 'Invalid section ID', 'Section not found');
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

        student = studentRepository.create({
          ...body,
          //@ts-ignore
          profile_picture: files?.profile_picture || '',
          other_docs: otherDocsJsonString,
          is_active: true,
          course: course,
          semester: semester,
          session: session,
          section: section,
        });

        await studentRepository.save(student);

        parentDetails = parentDetailsRepository.create({
          ...body,
          student: student,
        });
        await parentDetailsRepository.save(parentDetails);

        newStudent = await studentRepository.findOne({
          where: {
            admission_no: req.body.admission_no,
          },
          relations: ['parent_details', 'course', 'semester', 'section'],
        });

        if (newStudent) {
          const studentHistory = studentHistoryRepository.create({
            student: newStudent,
            course: course,
            semester: semester,
            session: session,
          });
          await studentHistoryRepository.save(studentHistory);
        }

        const feesGroup = await feesGroupRepository.findOne(
          req.body.fees_group_id,
        );
        if (!feesGroup) {
          sendError(res, 400, 'Fees group not found');
          errorOccurred = true;
          return;
        }

        let netAmount = 0;
        // try {
        //   const feesTypeData = JSON.parse(feesGroup.feesTypeData);
        //   if (Array.isArray(feesTypeData)) {
        //     feesTypeData.forEach((fee: any) => {
        //       if (fee.amount) {
        //         netAmount += fee.amount;
        //       }
        //     });
        //   }
        // } catch (error) {
        //   console.error('Error parsing fees type data:', error);
        //   sendError(res, 500, 'Failed to parse fees type data');
        //   errorOccurred = true;
        //   return;
        // }

        // newFeesMaster = feesMasterRepository.create({
        //   // student: newStudent,
        //   student_id: newStudent?.id,
        //   fees_group_id: req.body.fees_group_id,
        //   feesGroups: feesGroup,
        //   net_amount: netAmount,
        // });

        // await feesMasterRepository.save(newFeesMaster);
      });

      if (!errorOccurred) {
        sendResponse(res, 201, 'Student created successfully', newStudent);
      }
    });
  } catch (error: any) {
    if (!errorOccurred) {
      console.error(error);
      sendError(res, 500, 'Failed to create student', error.message);
    }
  }
};

const listStudents = async (req: Request, res: Response) => {
  try {
    let {
      search,
      session_id,
      section,
      course_id,
      semester_id,
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
      .leftJoinAndSelect('student.section', 'section')
      .leftJoinAndSelect('student.session', 'session')
      .leftJoinAndSelect('student.course', 'course')
      .leftJoinAndSelect('student.parent_details', 'parent_details')
      .leftJoinAndSelect('student.semester', 'semester');

    query = query.andWhere('student.is_active = true');

    // Apply search filter if provided
    if (search) {
      query = query.andWhere(
        '(student.first_name ILIKE :search OR student.last_name ILIKE :search OR student.middle_name ILIKE :search OR student.mobile ILIKE :search OR student.admission_no ILIKE :search OR student.enrollment_no ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (session_id) {
      query = query.andWhere(
        'CAST(student.session_id AS TEXT) LIKE :session_id',
        {
          session_id: `%${session_id}%`,
        },
      );
    }

    if (section) {
      query = query.andWhere('section.section LIKE :section', {
        section: `%${section}%`,
      });
    }

    if (course_id) {
      query = query.andWhere('course.id = :course_id', {
        course_id,
      });
    }

    if (semester_id) {
      query = query.andWhere('semester.id = :semester_id', {
        semester_id,
      });
    }

    // Apply pagination
    const totalCount = await query.getCount();
    const totalPages = Math.ceil(totalCount / limit);

    query = query.orderBy('student.createdAt', 'DESC');

    query = query.skip((page - 1) * limit).take(limit);

    // Execute the query
    const students = await query.getMany();

    const totalNoOfRecords = students.length;
    res.status(200).json({
      students,
      page,
      limit,
      totalCount,
      totalNoOfRecords,
      totalPages,
    });
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
      relations: ['parent_details', 'course', 'semester', 'section', 'session'],
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
      const { body, files }: { body: any; files?: any } = req;

      // Process other_docs files
      //@ts-ignore
      const otherDocsFiles = files?.other_docs || [];
      const otherDocs = otherDocsFiles.map((file: any) => ({
        name: file.originalname,
        path: file.path,
      }));

      // Convert otherDocs to JSON string
      const otherDocsString = JSON.stringify(otherDocs);

      const queryRunner = AppDataSource.createQueryRunner();

      let updatedStudent: Student | undefined;

      await runTransaction(queryRunner, async () => {
        const studentRepository = queryRunner.manager.getRepository(Student);
        const sessionRepository = queryRunner.manager.getRepository(Session);
        const parentDetailsRepository =
          queryRunner.manager.getRepository(ParentDetails);
        const student = await studentRepository.findOne({
          where: { id: +id },
          relations: ['parent_details'],
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

        let sessionExists;
        if (req.body.session_id) {
          sessionExists = await sessionRepository.findOne({
            where: { id: +req.body.session_id },
          });

          if (!sessionExists) {
            sendError(res, 400, 'Academic session does not exists');
            return;
          }
        }

        // Merge the updated data with existing data
        const updatedData: any = {
          ...req.body,
          studentSessionId: +req.body?.session_id,
          session_id: +req.body?.session_id,
          session: sessionExists,
          profile_picture:
            files?.profile_picture || student.profile_picture || [],
          other_docs: otherDocsString || student.other_docs,
        };

        // Merge the updated data with existing data
        studentRepository.merge(student, updatedData);

        updatedStudent = await studentRepository.save(student);

        if (updatedStudent && updatedStudent.parent_details) {
          const parentDetails = updatedStudent.parent_details;
          parentDetailsRepository.merge(parentDetails, body);
          await parentDetailsRepository.save(parentDetails);
        }
      });

      if (updatedStudent) {
        // Include parent details in the response
        const responseStudent = {
          ...updatedStudent,
          parent_details: updatedStudent.parent_details,
        };
        sendResponse(res, 200, 'Student updated successfully', responseStudent);
      }
    });
  } catch (error: any) {
    console.error(error);
    sendError(res, 500, 'Failed to update student', error.message);
  }
};

const deleteStudentsByIds = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!Array.isArray(id) || id.length === 0) {
      return sendError(res, 400, 'IDs must be provided as an array');
    }

    const studentRepository = AppDataSource.getRepository(Student);
    const queryRunner = AppDataSource.createQueryRunner();
    let notFoundCount = 0;

    await runTransaction(queryRunner, async () => {
      for (const idOfStudent of id) {
        let student = await studentRepository.findOne({
          where: { id: +idOfStudent },
        });
        if (!student) {
          console.warn(
            `Student with ID ${idOfStudent} not found, skipping deletion.`,
          );
          notFoundCount++;
          continue;
        }

        student.is_active = false;
        await studentRepository.save(student);
      }
      sendResponse(
        res,
        200,
        'Students deleted successfully',
        `${notFoundCount} students were not found while deleting`,
      );
    });
  } catch (error: any) {
    console.error(error);
    sendError(res, 500, 'Failed to delete students', error.message);
  }
};

export {
  createStudent,
  getStudentById,
  updateStudentById,
  deleteStudentsByIds,
  listStudents,
};

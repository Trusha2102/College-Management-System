import { Request, Response } from 'express';
import { FeesMaster } from '../../entity/FeesMaster';
import { sendResponse, sendError } from '../../utils/commonResponse';
import runTransaction from '../../utils/runTransaction';
import AppDataSource from '../../data-source';
import { Student } from '../../entity/Student';
import { FeesGroup } from '../../entity/FeesGroup';

export const feesAllocation = async (req: Request, res: Response) => {
  try {
    const { fees_group_ids, student_ids } = req.body;

    if (
      !Array.isArray(fees_group_ids) ||
      !Array.isArray(student_ids) ||
      student_ids.length === 0
    ) {
      return sendError(res, 400, 'Invalid payload');
    }
    const queryRunner = AppDataSource.createQueryRunner();

    const errors: string[] = [];

    // Run the transaction
    await runTransaction(queryRunner, async () => {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const feesMasterRepository =
        queryRunner.manager.getRepository(FeesMaster);
      const feesGroupRepository = queryRunner.manager.getRepository(FeesGroup);

      for (const student_id of student_ids) {
        const existingStudent = await studentRepository.findOne({
          where: { id: student_id },
        });
        if (!existingStudent) {
          errors.push(`Student with id ${student_id} not found`);
          continue;
        }

        for (const fees_group_id of fees_group_ids) {
          const feesGroup = await feesGroupRepository.findOne({
            where: { id: fees_group_id },
          });
          if (!feesGroup) {
            errors.push(`Fees group with id ${fees_group_id} not found`);
            continue;
          }

          // Retrieve fees type data from the FeesGroup
          const feesTypeData = feesGroup.feesTypeData;

          if (!feesTypeData) {
            errors.push(
              `Fees type data for fees group with id ${fees_group_id} not found`,
            );
            continue;
          }

          let netAmount = 0;
          try {
            const feesData = JSON.parse(feesTypeData);
            if (Array.isArray(feesData)) {
              feesData.forEach((fee: any) => {
                if (fee.amount) {
                  netAmount += fee.amount;
                }
              });
            }
          } catch (error) {
            console.error('Error parsing fees type data:', error);
            errors.push(
              `Error parsing fees type data for fees group with id ${fees_group_id}`,
            );
            continue;
          }

          const feesMaster = new FeesMaster();
          feesMaster.student = existingStudent;
          feesMaster.student_id = existingStudent.id;
          feesMaster.fees_group_ids = [fees_group_id];
          feesMaster.feesGroups = [feesGroup];
          feesMaster.net_amount = netAmount;

          await feesMasterRepository.save(feesMaster);
        }
      }
    });

    await queryRunner.release();

    if (errors.length > 0) {
      return sendError(
        res,
        400,
        'Failed to create fees master records',
        errors.join('; '),
      );
    }

    return sendResponse(res, 201, 'Fees master records created successfully');
  } catch (error) {
    console.error('Error creating fees master records:', error);
    return sendError(res, 500, 'Failed to create fees master records', error);
  }
};

export const getFeesMasterByStudentId = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const studentRepository = AppDataSource.getRepository(Student);

    const studentRecord = await studentRepository.findOne({
      where: { id: +student_id },
    });

    if (!studentRecord) {
      return sendError(res, 400, `Student with ID ${student_id} not found`);
    }

    const feesMasterRepository = AppDataSource.getRepository(FeesMaster);
    const feesMasters = await feesMasterRepository
      .createQueryBuilder('feesMaster')
      .leftJoinAndSelect('feesMaster.feesGroups', 'feesGroup')
      .leftJoinAndSelect('feesMaster.feesPayments', 'feesPayment')
      .leftJoinAndSelect('feesMaster.student', 'student')
      .where('feesMaster.student_id = :studentId', {
        studentId: parseInt(student_id),
      })
      .getMany();

    if (feesMasters.length === 0) {
      return res
        .status(404)
        .json({ error: 'No records found for the specified student ID' });
    }

    return res.status(200).json({ feesMasters });
  } catch (error) {
    console.error('Error fetching fees master records:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch fees master records' });
  }
};

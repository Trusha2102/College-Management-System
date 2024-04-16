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

    await runTransaction(queryRunner, async () => {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const feesMasterRepository =
        queryRunner.manager.getRepository(FeesMaster);
      const feesGroupRepository = queryRunner.manager.getRepository(FeesGroup);

      // Iterate through each student_id in the student_ids array
      for (const student_id of student_ids) {
        // Check if the provided student_id exists
        const existingStudent = await studentRepository.findOne({
          where: { id: student_id },
        });
        if (!existingStudent) {
          errors.push(`Student with id ${student_id} not found`);
          continue;
        }

        // Check if a record with the same student_id already exists
        const existingRecord = await feesMasterRepository.findOne({
          where: { student: { id: student_id } },
        });
        if (existingRecord) {
          errors.push(
            `Record for student with id ${student_id} already exists`,
          );
          continue;
        }

        // Iterate through each fees_group_id in the fees_group_ids array
        for (const fees_group_id of fees_group_ids) {
          // Fetch the FeesGroup entity based on the provided fees_group_id
          const feesGroup = await feesGroupRepository.findOne({
            where: { id: fees_group_id },
          });
          if (!feesGroup) {
            errors.push(`Fees group with id ${fees_group_id} not found`);
            continue; // Continue to the next fees group
          }

          // Retrieve fees type data from the FeesGroup
          const feesTypeData = feesGroup.feesTypeData;

          if (!feesTypeData) {
            errors.push(
              `Fees type data for fees group with id ${fees_group_id} not found`,
            );
            continue; // Continue to the next fees group
          }

          let netAmount = 0;
          try {
            // Parse fees type data to calculate net amount
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
            continue; // Continue to the next fees group
          }

          // Create a new FeesMaster entity
          const feesMaster = new FeesMaster();
          feesMaster.student = existingStudent;
          feesMaster.fees_group_ids = [fees_group_id];
          feesMaster.net_amount = netAmount;

          // Save the FeesMaster entity
          await feesMasterRepository.save(feesMaster);
        }
      }
    });

    // Release the query runner after the transaction completes
    await queryRunner.release();

    // Check if there are any errors
    if (errors.length > 0) {
      return sendError(
        res,
        400,
        'Failed to create fees master records',
        errors.join('; '),
      );
    }

    // Send success response if no errors
    return sendResponse(res, 201, 'Fees master records created successfully');
  } catch (error) {
    console.error('Error creating fees master records:', error);
    return sendError(res, 500, 'Failed to create fees master records', error);
  }
};

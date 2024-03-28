import { QueryRunner } from 'typeorm';

const runTransaction = async (
  queryRunner: QueryRunner,
  callback: () => Promise<void>,
) => {
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await callback();
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export default runTransaction;

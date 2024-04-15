import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteModuleRowsAndPermissions1625555555555
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Delete rows from the Permission table where moduleId's match the given IDs
    await queryRunner.query(`
            DELETE FROM "permission"
            WHERE "moduleId" IN (9, 10, 14, 17, 19, 20, 22, 23, 24, 25, 26, 27)
        `);

    // Delete rows from the Module table with specified IDs
    await queryRunner.query(`
            DELETE FROM "module" 
            WHERE id IN (9, 10, 14, 17, 19, 20, 22, 23, 24, 25, 26, 27)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No need to implement rollback logic as this is a deletion migration
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchemas1699999999999 implements MigrationInterface {
  name = 'CreateSchemas1699999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS auth`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS notifications`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS tasks`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS users`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS tasks CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS notifications CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS auth CASCADE`);
  }
}

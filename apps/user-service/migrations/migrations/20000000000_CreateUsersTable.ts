import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable20000000000 implements MigrationInterface {
    name = 'CreateUsersTable20000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(160) NOT NULL,
        "email" varchar(160) NOT NULL,
        "age" INT,
        "birthday" varchar(10) NOT NULL,
        "document" varchar(20),
        "created_by" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at_users()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_tasks_updated_at ON "users";
      CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON "users"
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at_tasks();
    `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "task_history";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "assignments";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "comments";`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_tasks_updated_at ON "tasks";`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS set_updated_at_tasks;`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tasks";`);
    }
}

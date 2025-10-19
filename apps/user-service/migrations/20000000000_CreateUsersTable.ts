import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable2000000000000 implements MigrationInterface {
    name = 'CreateUsersTable2000000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO users`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users."users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(160) NOT NULL,
        "email" varchar(160) NOT NULL,
        "role" varchar(160) NOT NULL,
        "birthday" timestamptz NULL,
        "document" varchar(20),
        "createdById" uuid NOT NULL,
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

      DROP TRIGGER IF EXISTS trg_users_updated_at ON users."users";
      CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users."users"
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at_users();
    `);
        await queryRunner.query(`SET search_path TO public`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO users`);
        await queryRunner.query(`DROP TABLE IF EXISTS users."users";`);
        await queryRunner.query(`SET search_path TO public`);
    }
}

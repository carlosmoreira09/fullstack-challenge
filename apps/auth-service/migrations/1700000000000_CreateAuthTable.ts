import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTable1700000000000 implements MigrationInterface {
    name = 'CreateAuthTable1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "auth" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar(255) NOT NULL,
        "username" varchar(50) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_auth_email" UNIQUE ("email"),
        CONSTRAINT "UQ_auth_username" UNIQUE ("username")
      );
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_auth_updated_at ON "auth";
      CREATE TRIGGER trg_auth_updated_at
      BEFORE UPDATE ON "auth"
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "auth"("id") ON DELETE CASCADE,
        "token_hash" varchar(255) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "created_by_ip" inet
      );
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_refresh_user" ON "refresh_tokens" ("user_id");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_refresh_expires" ON "refresh_tokens" ("expires_at");`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens";`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_auth_updated_at ON "auth";`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS set_updated_at;`);
        await queryRunner.query(`DROP TABLE IF EXISTS "auth";`);
    }
}

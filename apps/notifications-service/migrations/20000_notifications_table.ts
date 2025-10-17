import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable200000 implements MigrationInterface {
    name = 'InitNotifications1700030000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "type" varchar(30) NOT NULL, -- TASK_ASSIGNED | TASK_STATUS | COMMENT_NEW
        "payload" jsonb NOT NULL,
        "read_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_notif_user" ON "notifications" ("user_id");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_notif_created" ON "notifications" ("created_at");`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "notifications";`);
    }
}

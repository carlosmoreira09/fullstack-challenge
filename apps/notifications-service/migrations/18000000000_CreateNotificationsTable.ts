import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1800000000000 implements MigrationInterface {
    name = 'CreateNotificationsTable1800000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO notifications`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notifications."notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "type" varchar(30) NOT NULL,
        "status" varchar(30) NOT NULL,
        "title" varchar(255) NOT NULL,
        "payload" text,
        "metadata" jsonb,
        "read_at" timestamp,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_notif_user" ON notifications."notifications" ("userId");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_notif_created" ON notifications."notifications" ("createdAt");`);
        await queryRunner.query(`SET search_path TO public`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO notifications`);
        await queryRunner.query(`DROP TABLE IF EXISTS notifications."notifications";`);
        await queryRunner.query(`SET search_path TO public`);
    }
}

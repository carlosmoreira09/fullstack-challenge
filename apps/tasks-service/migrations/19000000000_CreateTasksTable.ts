import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable19000000000 implements MigrationInterface {
    name = 'CreateTasksTable19000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO tasks`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tasks."tasks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar(160) NOT NULL,
        "description" text,
        "priority" varchar(10) NOT NULL,
        "status" varchar(15) NOT NULL DEFAULT 'TODO',
        "due_date" timestamptz,
        "created_by" uuid NOT NULL, -- user_id (sem FK)
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at_tasks()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks."tasks";
      CREATE TRIGGER trg_tasks_updated_at
      BEFORE UPDATE ON tasks."tasks"
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at_tasks();
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tasks."comments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "task_id" uuid NOT NULL REFERENCES tasks."tasks"("id") ON DELETE CASCADE,
        "author_id" uuid NOT NULL,  -- user_id
        "content" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tasks."assignments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "task_id" uuid NOT NULL REFERENCES tasks."tasks"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL, -- user_id
        "role" varchar(30),
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tasks."task_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "task_id" uuid NOT NULL REFERENCES tasks."tasks"("id") ON DELETE CASCADE,
        "actor_id" uuid NOT NULL, -- user_id
        "change_type" varchar(20) NOT NULL, -- CREATE | UPDATE | STATUS_CHANGE | ASSIGN | COMMENT
        "before" jsonb,
        "after" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tasks_status" ON tasks."tasks" ("status");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tasks_priority" ON tasks."tasks" ("priority");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_comments_task" ON tasks."comments" ("task_id");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_assignments_task" ON tasks."assignments" ("task_id");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_history_task" ON tasks."task_history" ("task_id");`);

        await queryRunner.query(`SET search_path TO public`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO tasks`);
        await queryRunner.query(`DROP TABLE IF EXISTS tasks."task_history";`);
        await queryRunner.query(`DROP TABLE IF EXISTS tasks."assignments";`);
        await queryRunner.query(`DROP TABLE IF EXISTS tasks."comments";`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks."tasks";`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS set_updated_at_tasks;`);
        await queryRunner.query(`DROP TABLE IF EXISTS tasks."tasks";`);
        await queryRunner.query(`SET search_path TO public`);
    }
}

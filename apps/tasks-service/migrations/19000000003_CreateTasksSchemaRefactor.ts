import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksSchemaRefactor190000000003 implements MigrationInterface {
    name = "CreateTasksSchemaRefactor1900000000003";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO tasks`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tasks.tasks (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                title varchar(160) NOT NULL,
                description text,
                priority varchar(10) NOT NULL DEFAULT 'LOW',
                status varchar(15) NOT NULL DEFAULT 'TODO',
                due_date timestamptz,
                created_by_id uuid NOT NULL,
                assignees uuid[] DEFAULT ARRAY[]::uuid[],
                created_at timestamptz NOT NULL DEFAULT now(),
                updated_at timestamptz NOT NULL DEFAULT now()
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tasks.comments (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                task_id uuid NOT NULL REFERENCES tasks.tasks(id) ON DELETE CASCADE,
                author_id uuid NOT NULL,
                content text NOT NULL,
                created_at timestamptz NOT NULL DEFAULT now()
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tasks.task_assignments (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                task_id uuid NOT NULL REFERENCES tasks.tasks(id) ON DELETE CASCADE,
                user_id uuid NOT NULL,
                assigned_by_id uuid NOT NULL,
                assigned_at timestamptz NOT NULL DEFAULT now(),
                unassigned_at timestamptz,
                is_active boolean NOT NULL DEFAULT true
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tasks.task_history (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                task_id uuid NOT NULL REFERENCES tasks.tasks(id) ON DELETE CASCADE,
                user_id uuid NOT NULL,
                action varchar(50) NOT NULL,
                old_value jsonb,
                new_value jsonb,
                created_at timestamptz NOT NULL DEFAULT now()
            );
        `);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION tasks.set_tasks_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = now();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks.tasks;
            CREATE TRIGGER trg_tasks_updated_at
            BEFORE UPDATE ON tasks.tasks
            FOR EACH ROW
            EXECUTE FUNCTION tasks.set_tasks_updated_at();
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks.tasks(status);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks.tasks(priority);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_comments_task_id ON tasks.comments(task_id);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON tasks.task_assignments(task_id);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id ON tasks.task_assignments(user_id);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON tasks.task_history(task_id);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_task_history_action ON tasks.task_history(action);`);

        await queryRunner.query(`SET search_path TO public`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO tasks`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks.tasks;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS tasks.set_tasks_updated_at;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_task_history_action;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_task_history_task_id;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_task_assignments_user_id;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_task_assignments_task_id;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_comments_task_id;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_priority;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_status;`);
        await queryRunner.query(`DROP TABLE IF EXISTS tasks.task_history;`);
        await queryRunner.query(`DROP TABLE IF EXISTS tasks.task_assignments;`);
        await queryRunner.query(`DROP TABLE IF EXISTS tasks.comments;`);
        await queryRunner.query(`DROP TABLE IF EXISTS tasks.tasks;`);

        await queryRunner.query(`SET search_path TO public`);
    }
}

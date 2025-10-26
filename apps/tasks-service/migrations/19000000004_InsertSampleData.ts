import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertSampleData190000000004 implements MigrationInterface {
    name = "InsertSampleData1900000000004";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO tasks`);

        const taskId = 'a1bbcc33-3c1b-4bb4-8e2d-2ee2bd491c77';
        const taskAssignmentId = 'b2ccdd44-4d2c-4cc5-9f3e-3ff3ce5a2d88';
        const taskHistoryId = 'c3ddee55-5e3d-4dd6-aa4f-4aa4df6b3e99';
        const commentId = 'd4eeff66-6f4e-4ee7-bb5a-5bb5ea7c4faa';
        const creatorId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const assigneeId = 'b1ffcd88-8d1a-4ef9-9c7e-7cc8ce491b22';

        await queryRunner.query(`
            INSERT INTO tasks.tasks (id, title, description, priority, status, due_date, "created_by_id", assignees)
            VALUES (
                '${taskId}',
                'Sample task',
                'This is a sample task created via migration.',
                'HIGH',
                'IN_PROGRESS',
                now() + interval '7 days',
                '${creatorId}',
                ARRAY['${assigneeId}'::uuid]
            )
            ON CONFLICT (id) DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO tasks.comments (id, task_id, author_id, content)
            VALUES (
                '${commentId}',
                '${taskId}',
                '${assigneeId}',
                'Initial comment for sample task.'
            )
            ON CONFLICT (id) DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO tasks.task_assignments (id, task_id, user_id, assigned_by_id, assigned_at, is_active)
            VALUES (
                '${taskAssignmentId}',
                '${taskId}',
                '${assigneeId}',
                '${creatorId}',
                now(),
                true
            )
            ON CONFLICT (id) DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO tasks.task_history (id, task_id, user_id, action, new_value, created_at)
            VALUES (
                '${taskHistoryId}',
                '${taskId}',
                '${creatorId}',
                'CREATED',
                jsonb_build_object('status', 'IN_PROGRESS'),
                now()
            )
            ON CONFLICT (id) DO NOTHING;
        `);

        await queryRunner.query(`SET search_path TO public`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO tasks`);

        await queryRunner.query(`
            DELETE FROM tasks.task_history WHERE id = 'c3ddee55-5e3d-4dd6-aa4f-4aa4df6b3e99';
        `);
        await queryRunner.query(`
            DELETE FROM tasks.task_assignments WHERE id = 'b2ccdd44-4d2c-4cc5-9f3e-3ff3ce5a2d88';
        `);
        await queryRunner.query(`
            DELETE FROM tasks.comments WHERE id = 'd4eeff66-6f4e-4ee7-bb5a-5bb5ea7c4faa';
        `);
        await queryRunner.query(`
            DELETE FROM tasks.tasks WHERE id = 'a1bbcc33-3c1b-4bb4-8e2d-2ee2bd491c77';
        `);

        await queryRunner.query(`SET search_path TO public`);
    }
}

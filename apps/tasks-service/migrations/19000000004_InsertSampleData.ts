import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertSampleData190000000004 implements MigrationInterface {
    name = "InsertSampleData1900000000004";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO tasks`);

        const taskId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        const taskAssignmentId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
        const taskHistoryId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
        const commentId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
        const creatorId = '11111111-1111-1111-1111-111111111111';
        const assigneeId = '22222222-2222-2222-2222-222222222222';

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
            DELETE FROM tasks.task_history WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
        `);
        await queryRunner.query(`
            DELETE FROM tasks.task_assignments WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
        `);
        await queryRunner.query(`
            DELETE FROM tasks.comments WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
        `);
        await queryRunner.query(`
            DELETE FROM tasks.tasks WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        `);

        await queryRunner.query(`SET search_path TO public`);
    }
}

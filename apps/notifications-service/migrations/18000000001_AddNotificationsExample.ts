import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationsExample1800000000001 implements MigrationInterface {
    name = 'AddNotificationsExample1800000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const u1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const u2 = 'b1ffcd88-8d1a-4ef9-9c7e-7cc8ce491b22';
        const t1 = 'a1bbcc33-3c1b-4bb4-8e2d-2ee2bd491c77';
        const t2 = 'b2ccdd44-4d2c-4cc5-9f3e-3ff3ce5a2d88';

        const n1 = 'c3ddee55-5e3d-4dd6-aa4f-4aa4df6b3e99';
        const n2 = 'd4eeff66-6f4e-4ee7-bb5a-5bb5ea7c4faa';

        await queryRunner.query(`
      INSERT INTO notifications."notifications"("id","userId","type","status","title","payload","metadata", "read_at", "createdAt", "updatedAt")
      VALUES
        ('${n1}','${u1}','task_assigned', 'read', 'Task Assigned', 'You have been assigned to a new task', jsonb_build_object('taskId','${t1}','taskTitle','Implement auth'), now(), now(), now()),
        ('${n2}','${u2}','comment_created', 'read', 'New Comment', 'Someone commented on your task', jsonb_build_object('taskId','${t2}','by','${u1}','content','Vou começar pelo layout da lista'), now(), now(), now());
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM notifications."notifications" WHERE id IN
                                                                   ('c3ddee55-5e3d-4dd6-aa4f-4aa4df6b3e99','d4eeff66-6f4e-4ee7-bb5a-5bb5ea7c4faa');`);
    }
}

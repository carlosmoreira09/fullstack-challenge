import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationsExample20000000001 implements MigrationInterface {
    name = 'AddNotificationsExample20000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const u1 = '11111111-1111-1111-1111-111111111111';
        const u2 = '22222222-2222-2222-2222-222222222222';
        const t1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        const t2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

        const n1 = '12121212-1212-1212-1212-121212121212';
        const n2 = '34343434-3434-3434-3434-343434343434';

        await queryRunner.query(`
      INSERT INTO "notifications"(id,userId,type,payload)
      VALUES
        ('${n1}','${u2}','TASK_ASSIGNED', jsonb_build_object('taskId','${t1}','title','Implement auth')),
        ('${n2}','${u2}','COMMENT_NEW',  jsonb_build_object('taskId','${t2}','by','${u1}','content','Vou começar pelo layout da lista'));
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "notifications" WHERE id IN
                                                                   ('12121212-1212-1212-1212-121212121212','34343434-3434-3434-3434-343434343434');`);
    }
}

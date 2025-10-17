import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskExample190001 implements MigrationInterface {
    name = 'SeedTasksExamples1700020000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const u1 = '11111111-1111-1111-1111-111111111111';
        const u2 = '22222222-2222-2222-2222-222222222222';

        const t1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        const t2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
        const c1 = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
        const c2 = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
        const a1 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
        const a2 = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
        const h1 = '99999999-9999-9999-9999-999999999999';
        const h2 = '88888888-8888-8888-8888-888888888888';

        await queryRunner.query(`
      INSERT INTO "tasks"(id,title,description,priority,status,due_date,created_by)
      VALUES
        ('${t1}','Implement auth','Registrar e logar usuários','HIGH','IN_PROGRESS', now() + interval '3 days','${u1}'),
        ('${t2}','Lista de tarefas','Tela com filtros e busca','MEDIUM','TODO', NULL,'${u1}');
    `);

        await queryRunner.query(`
      INSERT INTO "comments"(id,task_id,author_id,content)
      VALUES
        ('${c1}','${t1}','${u2}','Posso pegar essa tarefa para revisão?'),
        ('${c2}','${t2}','${u1}','Vou começar pelo layout da lista');
    `);

        await queryRunner.query(`
      INSERT INTO "assignments"(id,task_id,user_id,role)
      VALUES
        ('${a1}','${t1}','${u2}','reviewer'),
        ('${a2}','${t2}','${u1}','owner');
    `);

        await queryRunner.query(`
      INSERT INTO "task_history"(id,task_id,actor_id,change_type,before,after)
      VALUES
        ('${h1}','${t1}','${u1}','CREATE', NULL, jsonb_build_object('status','IN_PROGRESS')),
        ('${h2}','${t2}','${u1}','CREATE', NULL, jsonb_build_object('status','TODO'));
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "task_history" WHERE id IN 
      ('99999999-9999-9999-9999-999999999999','88888888-8888-8888-8888-888888888888');`);
        await queryRunner.query(`DELETE FROM "assignments" WHERE id IN 
      ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','ffffffff-ffff-ffff-ffff-ffffffffffff');`);
        await queryRunner.query(`DELETE FROM "comments" WHERE id IN 
      ('cccccccc-cccc-cccc-cccc-cccccccccccc','dddddddd-dddd-dddd-dddd-dddddddddddd');`);
        await queryRunner.query(`DELETE FROM "tasks" WHERE id IN 
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');`);
    }
}

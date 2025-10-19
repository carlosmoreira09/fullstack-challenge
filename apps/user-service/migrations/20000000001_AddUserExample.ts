import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersExample2000000000001 implements MigrationInterface {
    name = 'AddUsersExample2000000000001'
    public async up(queryRunner: QueryRunner): Promise<void> {
        const u1 = '11111111-1111-1111-1111-111111111111';
        const u2 = '22222222-2222-2222-2222-222222222222';

        const t1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        const t2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
        const date = new Date().toISOString()



        await queryRunner.query(`
      INSERT INTO users."users"("id","name","email","role","birthday","document","createdById")
      VALUES
        ('${u1}','alice','alice@example.com','admin', '${date}','00011122255', '${t1}'),
        ('${u2}','bob','bob@example.com','user','${date}', '00022244455', '${t2}');
    `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM users."users" WHERE id IN 
      ('99999999-9999-9999-9999-999999999999','88888888-8888-8888-8888-888888888888');`);
 }
}

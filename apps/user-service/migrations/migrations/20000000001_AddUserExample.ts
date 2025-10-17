import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersExample19000000001 implements MigrationInterface {
    name = 'AddUsersExample19000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const u1 = '11111111-1111-1111-1111-111111111111';
        const u2 = '22222222-2222-2222-2222-222222222222';

        const t1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        const t2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';



        await queryRunner.query(`
      INSERT INTO "users"(id,name,email,age,birthday,document,created_by)
      VALUES
        ('${u1}','alice','alice@example.com',20,'00011122255', '${t1}'),
        ('${u2}','bob','bob@example.com',30,'55544433311', '${t2}');
    `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "users" WHERE id IN 
      ('99999999-9999-9999-9999-999999999999','88888888-8888-8888-8888-888888888888');`);
 }
}

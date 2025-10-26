import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersExample2000000000001 implements MigrationInterface {
    name = 'AddUsersExample2000000000001'
    public async up(queryRunner: QueryRunner): Promise<void> {
        const u1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const u2 = 'b1ffcd88-8d1a-4ef9-9c7e-7cc8ce491b22';

        const t1 = 'c2aade77-7e2b-4aa0-8d8f-8dd7df502c33';
        const t2 = 'd3bbef66-6f3c-4bb1-ae9a-9ee6ea613d44';
        const date = new Date().toISOString()

        await queryRunner.query(`
      INSERT INTO users."users"("id","name","email","role","birthday","document","createdById")
      VALUES
        ('${u1}','Alice santos','alice@example.com','admin', '${date}','00011122255', '${t1}'),
        ('${u2}','Bob twist','bob@example.com','user','${date}', '00022244455', '${t2}');
    `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM users."users" WHERE id IN 
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','b1ffcd88-8d1a-4ef9-9c7e-7cc8ce491b22');`);
 }
}

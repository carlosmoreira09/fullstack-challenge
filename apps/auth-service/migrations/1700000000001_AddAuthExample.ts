import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthExample1700000000001 implements MigrationInterface {
    name = 'AddAuthExample1700000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const u1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        const u2 = 'b1ffcd88-8d1a-4ef9-9c7e-7cc8ce491b22';
        const rt1 = 'e4ccdf11-1a4d-4cc2-8f0b-0ff0fb724e55';
        const rt2 = 'f5ddee22-2b5e-4dd3-aa1c-1aa1ac835f66';

        await queryRunner.query(`
            INSERT INTO auth."auth"("id","email", "role","username", "password_hash")
            VALUES 
                ('${u1}', 'alice@example.com', 'admin','alice@example.com', '$2b$12$54ToKdDgZlfg3C9dL3a3fOylBrmNLOebwjUMKnLKmdcjRomh0Dp1q'),
                ('${u2}', 'bob@example.com','user','bob@example.com', '$2b$12$54ToKdDgZlfg3C9dL3a3fOylBrmNLOebwjUMKnLKmdcjRomh0Dp1q');
        `);

        await queryRunner.query(`
            INSERT INTO auth."refresh_tokens"("id", "userId","token_hash", "expires_at", "created_by_ip")
            VALUES
                ('${rt1}', '${u1}', 'hash_refresh_1', now() + interval '7 days', '127.0.0.1'),
                ('${rt2}', '${u2}', 'hash_refresh_2', now() + interval '7 days', '127.0.0.1');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM auth."refresh_tokens" 
            WHERE id IN ('e4ccdf11-1a4d-4cc2-8f0b-0ff0fb724e55', 'f5ddee22-2b5e-4dd3-aa1c-1aa1ac835f66');
        `);
        
        await queryRunner.query(`
            DELETE FROM auth."auth" 
            WHERE id IN ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1ffcd88-8d1a-4ef9-9c7e-7cc8ce491b22');
        `);
    }
}

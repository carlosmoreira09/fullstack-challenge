import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthExample1700000000001 implements MigrationInterface {
    name = 'AddAuthExample1700000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const u1 = '11111111-1111-1111-1111-111111111111';
        const u2 = '22222222-2222-2222-2222-222222222222';
        const rt1 = '33333333-3333-3333-3333-333333333333';
        const rt2 = '44444444-4444-4444-4444-444444444444';

        await queryRunner.query(`
            INSERT INTO auth."auth"("id","email", "username", "password_hash")
            VALUES 
                ('${u1}', 'alice@example.com', 'alice', '$2b$12$54ToKdDgZlfg3C9dL3a3fOylBrmNLOebwjUMKnLKmdcjRomh0Dp1q'),
                ('${u2}', 'bob@example.com', 'bob', '$2b$12$54ToKdDgZlfg3C9dL3a3fOylBrmNLOebwjUMKnLKmdcjRomh0Dp1q');
        `);

        await queryRunner.query(`
            INSERT INTO auth."refresh_tokens"("id", "userId", "token_hash", "expires_at", "created_by_ip")
            VALUES
                ('${rt1}', '${u1}', 'hash_refresh_1', now() + interval '7 days', '127.0.0.1'),
                ('${rt2}', '${u2}', 'hash_refresh_2', now() + interval '7 days', '127.0.0.1');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM auth."refresh_tokens" 
            WHERE id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');
        `);
        
        await queryRunner.query(`
            DELETE FROM auth."auth" 
            WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
        `);
    }
}

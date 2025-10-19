import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { Client } from 'pg';

const parsePort = (value?: string) => parseInt(value || '5432', 10);

async function createSchemas(config: ConfigService, schema: string) {
    const schemas = [
        'auth', 'users', 'notifications', 'tasks',
    ]
    const sslOption = config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false;

    const client = new Client({
        host: config.get<string>('DB_HOST'),
        port: parsePort(config.get<string>('DB_PORT')),
        user: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        ssl: sslOption,
    });

    try {
        await client.connect();
        await Promise.all(schemas.map(schema => 
            client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`)
        ));
    } finally {
        await client.end();
    }
}

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: async (config: ConfigService) => {
                const isDev = process.env.NODE_ENV === 'development';
                const schema = 'auth';
                await createSchemas(config, schema);
                return {
                    type: 'postgres' as const,
                    host: config.get<string>('DB_HOST'),
                    port: parsePort(config.get<string>('DB_PORT')),
                    username: config.get<string>('DB_USERNAME'),
                    password: config.get<string>('DB_PASSWORD'),
                    database: config.get<string>('DB_DATABASE'),
                    entities: [join(__dirname, '../src/entities/*{.ts,.js}')],
                    schema,
                    migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
                    migrationsRun: true,
                    migrationsTableName: 'migrations',
                    synchronize: config.get('DB_SYNC') === 'true',
                    logging: isDev,
                    ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
                };
            },
            inject: [ConfigService],
        }),
    ],

    exports: [TypeOrmModule],
})
export class DatabaseModule {}

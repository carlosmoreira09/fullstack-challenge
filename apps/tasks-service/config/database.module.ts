import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { join } from 'path';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (config: ConfigService) => {
                const isDev = process.env.NODE_ENV === 'development';
                return {
                    type: 'postgres' as const,
                    host: config.get<string>('DB_HOST'),
                    port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
                    username: config.get<string>('DB_USERNAME'),
                    password: config.get<string>('DB_PASSWORD'),
                    database: config.get<string>('DB_DATABASE'),
                    schema: 'tasks',
                    entities: [join(__dirname, '../src/app/entities/**/*{.ts,.js}')],
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
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import {AuthEntity} from "./auth.entity";

@Entity('refresh_tokens')
export class RefreshToken {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => AuthEntity, { onDelete: 'CASCADE' })
    user: AuthEntity;

    @Column({ name: 'token_hash', length: 255 })
    tokenHash: string;

    @Index()
    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

    @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
    revokedAt?: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @Column({ name: 'created_by_ip', type: 'inet', nullable: true })
    createdByIp?: string | null;
}

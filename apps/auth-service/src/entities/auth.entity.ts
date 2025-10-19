import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity({ name: 'auth' })
export class AuthEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ length: 255 })
    email: string;

    @Index({ unique: true })
    @Column({ length: 50 })
    username: string;

    @Column({ name: 'password_hash', length: 255 })
    passwordHash: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;


    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {AuthEntity} from "auth-service/dist/src/app/entities/auth.entity";

@Entity('users')
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    birthday: Date;

    @Column()
    document: string;

    @Column()
    email: string;

    @Column()
    role: string;

    @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'createdById' })
    created_by: UsersEntity;

    @Column()
    createdById: number;

    @Column()
    created_at: Date;

    @Column()
    updated_at: Date;
}
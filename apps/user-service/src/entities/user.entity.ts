import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity('users', { schema: 'users' })
export class UsersEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 160 })
    name: string;

    @Column({ type: 'timestamp with time zone' })
    birthday: Date;

    @Column({ type: 'varchar', length: 20 })
    document: string;

    @Column({ type: 'varchar', length: 160 })
    email: string;

    @Column({ type: 'varchar', length: 160 })
    role: string;

    @Column({ type: 'uuid'})
    createdById: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}
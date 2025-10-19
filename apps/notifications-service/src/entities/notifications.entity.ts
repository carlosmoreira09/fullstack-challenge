import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('notifications')
export class NotificationsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        type: 'uuid'
    })
    userId: string;

    @Column({ length: 30 })
    type: string;

    @Column({
        type: 'jsonb'
    })
    payload: string;

    @Column({ nullable: true })
    readAt: Date;

    @CreateDateColumn()
    createdAt: Date;

}
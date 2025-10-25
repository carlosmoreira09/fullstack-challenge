import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {NotificationStatus, NotificationType} from "@taskmanagerjungle/types";

@Entity('notifications')
export class NotificationsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        type: 'uuid'
    })
    userId: string;

    @Column({ type: 'varchar', length: 30})
    type: NotificationType;

    @Column({ type: 'varchar', length: 30 })
    status: NotificationStatus;

    @Column()
    title: string;

    @Column({
        type: 'jsonb'
    })
    payload: string;

    @Column({ nullable: true })
    readAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
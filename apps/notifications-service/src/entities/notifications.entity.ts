import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('notifications')
export class NotificationsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({ length: 30 })
    type: string;

    @Column({
        type: 'jsonb'
    })
    payload: string;

    @Column()
    readAt: Date;

    @Column()
    createdAt: Date;

}
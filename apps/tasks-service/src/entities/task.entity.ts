import {
    Column,
    CreateDateColumn, DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {TaskPriority, TaskStatus} from "../enum/tasks.enum";

@Entity('tasks')
export class TaskEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column( {
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.LOW,
    })
    priority: TaskPriority;

    @Column( {
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.TODO,
    })
    status: TaskStatus;


    @Column({ type: 'timestamptz', nullable: true })
    dueDate?: Date | null;

    @Column()
    createdById: number;

    @Column()
    assignees: number[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    delete_at: Date;

}
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskEntity } from './task.entity';

export enum TaskHistoryAction {
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
    STATUS_CHANGED = 'STATUS_CHANGED',
    PRIORITY_CHANGED = 'PRIORITY_CHANGED',
    ASSIGNEE_ADDED = 'ASSIGNEE_ADDED',
    ASSIGNEE_REMOVED = 'ASSIGNEE_REMOVED',
    DUE_DATE_CHANGED = 'DUE_DATE_CHANGED',
}

@Entity({ name: 'task_history', schema: 'tasks' })
export class TaskHistoryEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'task_id', type: 'uuid' })
    taskId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 50 })
    action: TaskHistoryAction;

    @Column({ name: 'old_value', type: 'jsonb', nullable: true })
    oldValue?: Record<string, unknown> | null;

    @Column({ name: 'new_value', type: 'jsonb', nullable: true })
    newValue?: Record<string, unknown> | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
    createdAt: Date;

    @ManyToOne(() => TaskEntity, (task) => task.history, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'task_id' })
    task: TaskEntity;
}

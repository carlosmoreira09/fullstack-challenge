import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { CommentEntity } from './comment.entity';
import { TaskAssignmentEntity } from './task-assignment.entity';
import { TaskHistoryEntity } from './task-history.entity';
import {TaskPriority, TaskStatus} from "@taskmanagerjungle/types";

@Entity({ name: 'tasks', schema: 'tasks' })
export class TaskEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 160 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 10, default: TaskPriority.LOW })
    priority: TaskPriority;

    @Column({ type: 'varchar', length: 15, default: TaskStatus.TODO })
    status: TaskStatus;

    @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
    dueDate?: Date | null;

    @Column({ name: 'created_by_id', type: 'uuid' })
    createdById: string;

    @Column({ type: 'uuid', array: true, default: () => "ARRAY[]::uuid[]" })
    assignees: string[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
    updatedAt: Date;

    @OneToMany(() => CommentEntity, (comment) => comment.task)
    comments: CommentEntity[];

    @OneToMany(() => TaskAssignmentEntity, (assignment) => assignment.task)
    assignments: TaskAssignmentEntity[];

    @OneToMany(() => TaskHistoryEntity, (history) => history.task)
    history: TaskHistoryEntity[];
}

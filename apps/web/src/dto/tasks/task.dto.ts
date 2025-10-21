export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface Task {
    id?: string;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    assignees: string[];
    createdById?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ListTasksParams {
    page?: number;
    size?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    createdById?: string;
}

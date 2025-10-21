export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}

export interface Task {
    id?: string;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    assignees: string[];
    assigneesData?: User[];
    createdById?: string;
    createdByData?: User;
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
export interface TaskComment {
    id: string
    taskId?: string
    authorId: string
    authorName: string
    content: string
    createdAt: string
}

export type ChangeType = "CREATE" | "UPDATE" | "STATUS_CHANGE" | "ASSIGN" | "COMMENT"

export interface TaskHistoryEntry {
    id: string
    taskId: string
    actorId: string
    actorName: string
    changeType: ChangeType
    before: any
    after: any
    createdAt: string
}
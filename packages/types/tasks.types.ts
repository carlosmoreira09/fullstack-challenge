export type TaskPriority = 'LOW'|'MEDIUM'|'HIGH'|'URGENT';
export type TaskStatus = 'TODO'|'IN_PROGRESS'|'REVIEW'|'DONE';

export interface TaskEventBase {
    id: string;
    actorId: string;
    occurredAt: string;
}


export interface TaskCreatedEvent extends TaskEventBase {
    type: 'task.created';
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    assignees: string[]; // user ids
}


export interface TaskUpdatedEvent extends TaskEventBase {
    type: 'task.updated';
    changes: Record<string, { before:any; after:any }>; // diff simplificado
}


export interface TaskCommentedEvent extends TaskEventBase {
    type: 'task.commented';
    commentId: string;
    taskId: string;
    content: string;
}
export interface CreateTaskDto {
    title: string;
    description?: string | null;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    dueDate?: string | null;
    assignees?: string[];
    createdById: string;
}

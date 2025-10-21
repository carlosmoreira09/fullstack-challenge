import apiClient from "@/lib/interceptor.ts";
import type { CreateTaskDto } from "@/dto/tasks/create-task.dto.ts";
import type { ListTasksParams, Task } from "@/dto/tasks/task.dto.ts";

const serializeCreateTaskPayload = (data: CreateTaskDto) => {
    const payload: Record<string, unknown> = {
        title: data.title.trim(),
        description: data.description?.trim(),
        priority: data.priority ?? 'LOW',
        status: data.status ?? 'TODO',
        dueDate: data.dueDate ?? null,
        assignees: data.assignees ?? [],
        createdById: data.createdById,
    };

    if (!payload.description) {
        delete payload.description;
    }

    if (!payload.dueDate) {
        payload.dueDate = null;
    }

    return payload;
};

export const taskService = () => {
    const listTasks = async (params: ListTasksParams = {}) => {
        const response = await apiClient.get<Task[]>("/api/tasks", { params });
        return response.data;
    };

    const createTask = async (data: CreateTaskDto) => {
        const response = await apiClient.post<Task>("/api/tasks", serializeCreateTaskPayload(data));
        return response.data;
    };

    return {
        listTasks,
        createTask,
    };
};

import apiClient from "@/lib/interceptor.ts";
import type { CreateTaskDto, UpdateTaskDto, ListTasksParams, Task } from "@/types";

type TaskPayload = CreateTaskDto & { id?: string };

const normalizeTaskPayload = (data: TaskPayload) => {
    const payload: Record<string, unknown> = {
        id: data.id,
        title: data.title?.trim() || '',
        description: data.description?.trim() || '',
        priority: data.priority ?? "LOW",
        status: data.status ?? "TODO",
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

    if (!payload.id) {
        delete payload.id;
    }

    if (!payload.createdById) {
        delete payload.createdById;
    }

    return payload;
};

export const taskService = () => {
    const listTasks = async (params: ListTasksParams = {}) => {
        const response = await apiClient.get<Task[]>("/tasks", { params });
        return response.data;
    };

    const createTask = async (data: CreateTaskDto) => {
        const response = await apiClient.post<Task>("/tasks", normalizeTaskPayload(data));
        return response.data;
    };

    const updateTask = async (data: UpdateTaskDto) => {
        const response = await apiClient.put("/tasks", normalizeTaskPayload(data));
        return response.data;
    };

    const getTaskById = async (id: string) => {
        const tasks = await listTasks();
        return tasks.find((task) => task.id === id) ?? null;
    };

    const listTasksByUser = async (userId: string, includeAssigned: boolean = false) => {
        const response = await apiClient.get<Task[]>(`/tasks/user/${userId}`, {
            params: { includeAssigned: includeAssigned.toString() }
        });
        return response.data;
    };

    return {
        listTasks,
        createTask,
        updateTask,
        getTaskById,
        listTasksByUser,
    };
};

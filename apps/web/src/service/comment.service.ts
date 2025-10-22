import apiClient from "@/lib/interceptor.ts";
import type { TaskComment } from "@taskmanagerjungle/types";

export interface CreateCommentDto {
    taskId: string;
    content: string;
}

export interface UpdateCommentDto {
    content: string;
}

export const commentService = () => {
    const getCommentsByTask = async (taskId: string): Promise<TaskComment[]> => {
        try {
            const response = await apiClient.get<TaskComment[]>(`/comments/task/${taskId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    };

    const createComment = async (data: CreateCommentDto): Promise<TaskComment> => {
        const response = await apiClient.post<TaskComment>("/comments", data);
        return response.data;
    };

    const updateComment = async (id: string, data: UpdateCommentDto): Promise<TaskComment> => {
        const response = await apiClient.put<TaskComment>(`/comments/${id}`, data);
        return response.data;
    };

    const deleteComment = async (id: string): Promise<void> => {
        await apiClient.delete(`/comments/${id}`);
    };

    return {
        getCommentsByTask,
        createComment,
        updateComment,
        deleteComment,
    };
};

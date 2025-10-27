import apiClient from "@/lib/interceptor.ts";
import type { TaskComment, CreateCommentDto, UpdateCommentDto } from "@/types";

export interface PaginatedComments {
    data: TaskComment[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const commentService = () => {
    const getCommentsByTask = async (taskId: string, page: number = 1, size: number = 10): Promise<PaginatedComments> => {
        try {
            const response = await apiClient.get<PaginatedComments>(`/tasks/${taskId}/comments`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            return {
                data: [],
                meta: {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 0
                }
            };
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

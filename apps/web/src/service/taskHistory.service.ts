import apiClient from "@/lib/interceptor.ts";

export interface TaskHistoryEntry {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    createdAt: string;
}

export const taskHistoryService = () => {
    const getHistoryByTask = async (taskId: string): Promise<TaskHistoryEntry[]> => {
        try {
            const response = await apiClient.get<TaskHistoryEntry[]>(`/tasks-history/task/${taskId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching task history:', error);
            return [];
        }
    };

    return {
        getHistoryByTask,
    };
};

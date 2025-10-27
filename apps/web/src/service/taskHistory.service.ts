import apiClient from "@/lib/interceptor.ts";
import { type TaskHistoryEntry} from "@/types";

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

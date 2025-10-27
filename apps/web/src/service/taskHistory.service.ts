import type {TaskHistoryEntry} from '@/types';
import apiClient from '@/lib/interceptor.ts'

export const taskHistoryService = () => {
  const getHistoryByTask = async (
    taskId: string,
  ): Promise<Array<TaskHistoryEntry>> => {
    try {
      const response = await apiClient.get<Array<TaskHistoryEntry>>(
        `/tasks-history/task/${taskId}`,
      )
      return response.data
    } catch (error) {
      console.error('Error fetching task history:', error)
      return []
    }
  }

  return {
    getHistoryByTask,
  }
}

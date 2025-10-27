import type { User } from './users.types'

/**
 * Task Enums
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export enum TaskHistoryAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  PRIORITY_CHANGED = 'PRIORITY_CHANGED',
  ASSIGNEE_ADDED = 'ASSIGNEE_ADDED',
  ASSIGNEE_REMOVED = 'ASSIGNEE_REMOVED',
  DUE_DATE_CHANGED = 'DUE_DATE_CHANGED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED',
}

export interface Task {
  id?: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string | null
  assignees: Array<string>
  assigneesData?: Array<User>
  createdById?: string
  createdByData?: User
  createdAt?: string
  updatedAt?: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string | null
  assignees?: Array<string>
  createdById?: string
}

export interface UpdateTaskDto {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string | null
  assignees: Array<string>
  createdById: string | null
}

export interface ListTasksParams {
  page?: number
  size?: number
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  createdById?: string
}

export interface TaskComment {
  id: string
  taskId?: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

export interface CreateCommentDto {
  taskId: string
  content: string
}

export interface UpdateCommentDto {
  id?: string
  content: string
}

export interface TaskHistoryEntry {
  id: string
  taskId: string
  userId: string
  userName: string
  action: TaskHistoryAction
  oldValue?: Record<string, unknown> | null
  newValue?: Record<string, unknown> | null
  createdAt: string
  userData?: {
    id: string
    name: string
    email: string
    role?: string
  } | null
}

export interface TaskAssignment {
  id: string
  taskId: string
  userId: string
  assignedAt: string
  assignedBy: string
}

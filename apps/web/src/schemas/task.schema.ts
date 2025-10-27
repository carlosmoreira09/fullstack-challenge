import { z } from 'zod'
import {TaskPriority, TaskStatus} from "@/types";

export const taskPrioritySchema = z.enum(TaskPriority, {
  message: 'Prioridade inválida',
})

export const taskStatusSchema = z.enum(TaskStatus, {
  message: 'Status inválido',
})

export const createTaskSchema = z.object({
  title: z
    .string('Título é obrigatório')
    .trim()
    .min(1, 'Título é obrigatório')
    .max(160, 'Título deve ter no máximo 160 caracteres'),
  description: z
    .string()
    .trim()
    .max(5000, 'Descrição deve ter no máximo 5000 caracteres'),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  dueDate: z
    .string()
    .refine(
      (date) => {
        if (!date || date === '') return true
        const selectedDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate >= today
      },
      { message: 'O prazo não pode ser no passado' },
    ),
  assignees: z
    .array(z.uuid('ID do responsável deve ser um UUID válido')),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.uuid('ID da tarefa deve ser um UUID válido'),
})

export type CreateTaskFormData = z.infer<typeof createTaskSchema>
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>

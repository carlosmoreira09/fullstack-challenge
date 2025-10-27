import { z } from 'zod';

const taskPriorityValues = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const taskStatusValues = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;

export const taskPrioritySchema = z.enum(taskPriorityValues, {
    message: 'Prioridade inválida'
});

export const taskStatusSchema = z.enum(taskStatusValues, {
    message: 'Status inválido'
});

export const createTaskSchema = z.object({
    title: z
        .string( 'Título é obrigatório' )
        .trim()
        .min(1, 'Título é obrigatório')
        .min(3, 'Título deve ter pelo menos 3 caracteres')
        .max(160, 'Título deve ter no máximo 160 caracteres'),
    description: z
        .string()
        .trim()
        .max(5000, 'Descrição deve ter no máximo 5000 caracteres')
        .optional()
        .default(''),
    priority: taskPrioritySchema.default('MEDIUM'),
    status: taskStatusSchema.default('TODO'),
    dueDate: z
        .string()
        .optional()
        .default('')
        .refine((date) => {
            if (!date || date === '') return true;
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectedDate >= today;
        }, { message: 'O prazo não pode ser no passado' }),
    assignees: z
        .array(z.string().uuid('ID do responsável deve ser um UUID válido'))
        .default([]),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
    id: z.string().uuid('ID da tarefa deve ser um UUID válido'),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

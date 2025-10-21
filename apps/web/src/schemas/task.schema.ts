import { z } from 'zod';

const taskPriorityValues = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const taskStatusValues = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;

export const taskPrioritySchema = z
    .string({ error: 'Prioridade é obrigatória' })
    .pipe(z.enum(taskPriorityValues, { message: 'Prioridade inválida' }));

export const taskStatusSchema = z
    .string({ error: 'Status é obrigatório' })
    .pipe(z.enum(taskStatusValues, { message: 'Status inválido' }));

export const createTaskSchema = z.object({
    title: z
        .string({ error: 'Título é obrigatório' })
        .trim()
        .min(1, 'Título é obrigatório')
        .max(160, 'Título deve ter no máximo 160 caracteres'),
    description: z
        .string()
        .trim()
        .max(5000, 'Descrição deve ter no máximo 5000 caracteres')
        .optional()
        .nullable(),
    priority: taskPrioritySchema.default('LOW'),
    status: taskStatusSchema.default('TODO'),
    dueDate: z
        .iso
        .datetime({ offset: true, message: 'Data de entrega deve estar em formato ISO válido' })
        .optional()
        .nullable(),
    assignees: z
        .array(z.uuid('ID do responsável deve ser um UUID válido'))
        .default([]),
    createdById: z.uuid('ID do criador deve ser um UUID válido'),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
    id: z.uuid('ID da tarefa deve ser um UUID válido'),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

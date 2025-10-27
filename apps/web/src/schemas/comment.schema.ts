import { z } from 'zod';

export const createCommentSchema = z.object({
  taskId: z.uuid('ID da tarefa deve ser um UUID válido'),
  content: z
    .string('Conteúdo é obrigatório')
    .trim()
    .min(1, 'Conteúdo é obrigatório')
    .max(5000, 'Conteúdo deve ter no máximo 5000 caracteres'),
  authorId: z.uuid('ID do autor deve ser um UUID válido'),
});

export const updateCommentSchema = z.object({
  id: z.uuid('ID do comentário deve ser um UUID válido'),
  content: z
    .string('Conteúdo é obrigatório')
    .trim()
    .min(1, 'Conteúdo é obrigatório')
    .max(5000, 'Conteúdo deve ter no máximo 5000 caracteres'),
});

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;
export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;

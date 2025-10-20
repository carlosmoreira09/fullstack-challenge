import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  birthday: z.string().min(1, 'Data de nascimento é obrigatória'),
  document: z.string().min(1, 'Documento é obrigatório'),
  role: z.string().min(1, 'Função é obrigatória'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  createdById: z.string().min(1, 'ID do criador é obrigatório'),
});

export const updateUserSchema = createUserSchema.partial().extend({
    id: z.string().min(1),
})


export const changePasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha deve ter no mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof createUserSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

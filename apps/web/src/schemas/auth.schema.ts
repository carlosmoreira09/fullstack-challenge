import { z } from 'zod'

export const loginSchema = z.object({
  username: z.email('E-mail inválido'),
  password: z
    .string('Senha é obrigatória')
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

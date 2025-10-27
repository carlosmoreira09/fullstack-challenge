import React, { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { User } from '@/dto/users/users.dto.ts'
import type {ChangePasswordFormData} from '@/schemas/user.schema';
import { apiClient } from '@/lib/interceptor.ts'
import {
  
  changePasswordSchema
} from '@/schemas/user.schema'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  user,
}: ChangePasswordDialogProps) {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    password: '',
    confirmPassword: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open) {
      setFormData({ password: '', confirmPassword: '' })
      setFormErrors({})
    }
  }, [open])

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      const response = await apiClient.patch(
        `/users/${user?.id}/password`,
        data,
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Senha alterada com sucesso!')
      onOpenChange(false)
      setFormData({ password: '', confirmPassword: '' })
      setFormErrors({})
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const result = changePasswordSchema.safeParse(formData)

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      setFormErrors(errors)
      return
    }

    changePasswordMutation.mutate({ password: result.data.password })
  }

  const handleInputChange = (
    field: keyof ChangePasswordFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Altere a senha do usuário <strong>{user?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Digite a nova senha"
              />
              {formErrors.password && (
                <span className="text-sm text-red-500">
                  {formErrors.password}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                placeholder="Confirme a nova senha"
              />
              {formErrors.confirmPassword && (
                <span className="text-sm text-red-500">
                  {formErrors.confirmPassword}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending
                ? 'Alterando...'
                : 'Alterar Senha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

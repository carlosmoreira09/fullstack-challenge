import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/interceptor.ts';
import { createUserSchema, type CreateUserFormData } from '@/schemas/user.schema';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {User} from "@/types";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateUserFormData>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { decoded } = useAuth();
  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        document: user.document,
        role: user.role,
        birthday: user.birthday,
      });
    } else {
      setFormData({});
    }
    setFormErrors({});
  }, [user, open]);

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const response = await apiClient.post('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
      onOpenChange(false);
      setFormData({});
      setFormErrors({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar usuário');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: Omit<Partial<CreateUserFormData>, 'password'>) => {
      const response = await apiClient.put(`/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso!');
      onOpenChange(false);
      setFormData({});
      setFormErrors({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar usuário');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      const { password, ...dataToUpdate } = formData;
      updateUserMutation.mutate(dataToUpdate);
    } else {
      const dataWithCreator = {
        ...formData,
        createdById: decoded?.userId || '',
      };

      const result = createUserSchema.safeParse(dataWithCreator);

      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error?.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setFormErrors(errors);
        return;
      }

      createUserMutation.mutate(result.data);
    }
  };

  const handleInputChange = (field: keyof CreateUserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Atualize os dados do usuário'
                : 'Preencha os dados do novo usuário'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {formErrors.name && (
                <span className="text-sm text-red-500">{formErrors.name}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {formErrors.email && (
                <span className="text-sm text-red-500">{formErrors.email}</span>
              )}
            </div>

            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                {formErrors.password && (
                  <span className="text-sm text-red-500">{formErrors.password}</span>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="document">Documento</Label>
              <Input
                id="document"
                value={formData.document || ''}
                onChange={(e) => handleInputChange('document', e.target.value)}
              />
              {formErrors.document && (
                <span className="text-sm text-red-500">{formErrors.document}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <Input
                id="role"
                value={formData.role || ''}
                onChange={(e) => handleInputChange('role', e.target.value)}
              />
              {formErrors.role && (
                <span className="text-sm text-red-500">{formErrors.role}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="birthday">Data de Nascimento</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday || ''}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
              />
              {formErrors.birthday && (
                <span className="text-sm text-red-500">{formErrors.birthday}</span>
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
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? 'Atualizando...'
                  : 'Criando...'
                : isEditing
                ? 'Atualizar Usuário'
                : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

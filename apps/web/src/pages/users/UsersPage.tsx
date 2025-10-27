import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createRoute } from '@tanstack/react-router'
import { apiClient } from '@/lib/interceptor.ts'
import { Button } from '@/components/ui/button'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { UsersList } from '@/components/users/UsersList'
import { ChangePasswordDialog } from '@/components/users/ChangePasswordDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { authenticatedRoute } from '@/components/ProtectedRoute.tsx'

interface User {
  id: string
  name: string
  email: string
  document: string
  role: string
  birthday: string
  created_at: string
}
export const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/usuarios',
  component: UsersPage,
})

export default function UsersPage() {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToChangePassword, setUserToChangePassword] = useState<User | null>(
    null,
  )
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery<Array<User>>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/users')
      return response.data
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário excluído com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir usuário')
    },
  })

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsFormDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsFormDialogOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleChangePassword = (user: User) => {
    setUserToChangePassword(user)
    setIsPasswordDialogOpen(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id)
      setUserToDelete(null)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuários</h1>
        <Button onClick={handleCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      <UsersList
        users={users}
        isLoading={isLoading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onChangePassword={handleChangePassword}
      />

      <UserFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        user={selectedUser}
      />

      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        user={userToChangePassword}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário "${userToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}

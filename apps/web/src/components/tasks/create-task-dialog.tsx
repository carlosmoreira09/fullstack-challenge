'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Task,User } from '@/types'
import type {CreateTaskFormData} from '@/schemas/task.schema';
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { userService } from '@/service/user.service.ts'
import {  TaskPriority, TaskStatus } from '@/types'
import {
  
  createTaskSchema
} from '@/schemas/task.schema'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTask: (task: Omit<Task, 'id'>) => void
  initialStatus?: TaskStatus
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onCreateTask,
  initialStatus,
}: CreateTaskDialogProps) {
  const [users, setUsers] = useState<Array<User>>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const usersApi = useMemo(() => userService(), [])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: initialStatus || TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: '',
      assignees: [],
    },
    mode: 'onBlur',
  })

  const assignees = watch('assignees')

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true)
      setUsersError(null)
      const response = await usersApi.listUsers()
      setUsers(response)
    } catch (error) {
      setUsersError('Não foi possível carregar os usuários.')
    } finally {
      setIsLoadingUsers(false)
    }
  }, [usersApi])

  useEffect(() => {
    if (!open) {
      return
    }

    void fetchUsers()

    if (initialStatus) {
      setValue('status', initialStatus)
    }
  }, [open, fetchUsers, initialStatus, setValue])

  const handleToggleAssignee = (userId: string) => {
    const currentAssignees = assignees
    const alreadySelected = currentAssignees.includes(userId)
    const newAssignees = alreadySelected
      ? currentAssignees.filter((id) => id !== userId)
      : [...currentAssignees, userId]
    setValue('assignees', newAssignees)
  }

  const onSubmit = (data: CreateTaskFormData) => {
    onCreateTask(data)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da tarefa. Clique em criar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Implementar autenticação JWT"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva os detalhes da tarefa..."
                {...register('description')}
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Baixa</SelectItem>
                        <SelectItem value="MEDIUM">Média</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="URGENT">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="REVIEW">Review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Prazo</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Assignees */}
            <div className="grid gap-2">
              <Label>Responsáveis</Label>
              <div className="rounded-md border">
                <ScrollArea className="h-40">
                  <div className="flex flex-col">
                    {isLoadingUsers && (
                      <p className="px-4 py-3 text-sm text-muted-foreground">
                        Carregando usuários...
                      </p>
                    )}
                    {usersError && (
                      <div className="space-y-3 px-4 py-3 text-sm text-muted-foreground">
                        <p>{usersError}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void fetchUsers()}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    )}
                    {!isLoadingUsers &&
                      !usersError &&
                      users.filter((user): user is User & { id: string } =>
                        Boolean(user.id),
                      ).length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          Nenhum usuário disponível.
                        </p>
                      )}
                    {!isLoadingUsers &&
                      !usersError &&
                      users
                        .filter(
                          (user): user is User & { id: string } =>
                            typeof user.id === 'string' && user.id.length > 0,
                        )
                        .map((user) => {
                          const checked = assignees.includes(user.id)
                          return (
                            <label
                              key={user.id}
                              className="flex items-center justify-between gap-3 border-b px-4 py-2 last:border-b-0"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">
                                  {user.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={checked}
                                onChange={() => handleToggleAssignee(user.id)}
                              />
                            </label>
                          )
                        })}
                  </div>
                </ScrollArea>
              </div>
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
            <Button type="submit">Criar Tarefa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

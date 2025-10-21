"use client"

import type React from "react"
import {useCallback, useEffect, useMemo, useState} from "react"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import type {Task, TaskPriority, TaskStatus} from "@/dto/tasks/task.dto.ts";
import type {User} from "@/dto/users/users.dto.ts";
import {ScrollArea} from "@/components/ui/scroll-area"
import {userService} from "@/service/user.service.ts";

interface CreateTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreateTask: (task: Omit<Task, "id">) => void
}

export function CreateTaskDialog({ open, onOpenChange, onCreateTask }: CreateTaskDialogProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "TODO" as TaskStatus,
        priority: "MEDIUM" as TaskPriority,
        dueDate: "",
        assignees: [] as string[],
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [users, setUsers] = useState<User[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [usersError, setUsersError] = useState<string | null>(null)

    const usersApi = useMemo(() => userService(), [])

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoadingUsers(true)
            setUsersError(null)
            const response = await usersApi.listUsers()
            setUsers(response)
        } catch (error) {
            setUsersError("Não foi possível carregar os usuários.")
        } finally {
            setIsLoadingUsers(false)
        }
    }, [usersApi])

    useEffect(() => {
        if (!open) {
            return
        }

        void fetchUsers()
    }, [open, fetchUsers])

    const handleToggleAssignee = (userId: string) => {
        setFormData((prev) => {
            const alreadySelected = prev.assignees.includes(userId)
            return {
                ...prev,
                assignees: alreadySelected
                    ? prev.assignees.filter((id) => id !== userId)
                    : [...prev.assignees, userId],
            }
        })
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = "O título é obrigatório"
        } else if (formData.title.length < 3) {
            newErrors.title = "O título deve ter pelo menos 3 caracteres"
        } else if (formData.title.length > 100) {
            newErrors.title = "O título deve ter no máximo 100 caracteres"
        }

        // Description validation
        if (formData.description && formData.description.length > 500) {
            newErrors.description = "A descrição deve ter no máximo 500 caracteres"
        }

        // Deadline validation
        if (formData.dueDate) {
            const selectedDate = new Date(formData.dueDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (selectedDate < today) {
                newErrors.dueDate = "O prazo não pode ser no passado"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            onCreateTask(formData)

            // Reset form and errors
            setFormData({
                title: "",
                description: "",
                status: "TODO",
                priority: "MEDIUM",
                dueDate: "",
                assignees: [],
            })
            setErrors({})
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Criar Nova Tarefa</DialogTitle>
                    <DialogDescription>Preencha os detalhes da tarefa. Clique em criar quando terminar.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                placeholder="Ex: Implementar autenticação JWT"
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({ ...formData, title: e.target.value })
                                    if (errors.title) {
                                        setErrors({ ...errors, title: "" })
                                    }
                                }}
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                placeholder="Descreva os detalhes da tarefa..."
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData({ ...formData, description: e.target.value })
                                    if (errors.description) {
                                        setErrors({ ...errors, description: "" })
                                    }
                                }}
                                rows={3}
                                className={errors.description ? "border-red-500" : ""}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        {/* Priority and Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Prioridade</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
                                >
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
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
                                >
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
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="grid gap-2">
                            <Label htmlFor="deadline">Prazo</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => {
                                    setFormData({ ...formData, dueDate: e.target.value })
                                    if (errors.deadline) {
                                        setErrors({ ...errors, deadline: "" })
                                    }
                                }}
                                className={errors.deadline ? "border-red-500" : ""}
                            />
                            {errors.deadline && <p className="text-sm text-red-500">{errors.deadline}</p>}
                        </div>

                        {/* Assignees */}
                        <div className="grid gap-2">
                            <Label>Responsáveis</Label>
                            <div className="rounded-md border">
                                <ScrollArea className="h-40">
                                    <div className="flex flex-col">
                                        {isLoadingUsers && (
                                            <p className="px-4 py-3 text-sm text-muted-foreground">Carregando usuários...</p>
                                        )}
                                        {usersError && (
                                            <div className="space-y-3 px-4 py-3 text-sm text-muted-foreground">
                                                <p>{usersError}</p>
                                                <Button type="button" size="sm" variant="outline" onClick={() => void fetchUsers()}>
                                                    Tentar novamente
                                                </Button>
                                            </div>
                                        )}
                                        {!isLoadingUsers && !usersError && users.filter((user): user is User & { id: string } => Boolean(user.id)).length === 0 && (
                                            <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum usuário disponível.</p>
                                        )}
                                        {!isLoadingUsers && !usersError &&
                                            users
                                                .filter((user): user is User & { id: string } => typeof user.id === "string" && user.id.length > 0)
                                                .map((user) => {
                                                    const checked = formData.assignees.includes(user.id)
                                                    return (
                                                        <label
                                                            key={user.id}
                                                            className="flex items-center justify-between gap-3 border-b px-4 py-2 last:border-b-0"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-foreground">{user.name}</span>
                                                                <span className="text-xs text-muted-foreground">{user.email}</span>
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Criar Tarefa</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

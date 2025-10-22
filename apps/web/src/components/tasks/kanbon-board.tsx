import {useCallback, useEffect, useMemo, useState} from "react"
import {Plus, UserCircle} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import {useNavigate} from "@tanstack/react-router";
import {KanbanColumn} from "@/components/tasks/kanban.tsx";
import {CreateTaskDialog} from "@/components/tasks/create-task-dialog.tsx";
import {type Task, TaskStatus} from "@taskmanagerjungle/types";
import {taskService} from "@/service/task.service.ts";
import {userService} from "@/service/user.service.ts";
import {useAuth} from "@/hooks/auth.tsx";
import type {User} from "@/dto/users/users.dto.ts";

const COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: TaskStatus.TODO, title: "To Do" },
    { id: TaskStatus.IN_PROGRESS, title: "In Progress" },
    { id: TaskStatus.REVIEW, title: "Review" },
    { id: TaskStatus.DONE, title: "Done" },
]

export function KanbanBoard() {
    const router = useNavigate()
    const [tasks, setTasks] = useState<Task[]>([])
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>(undefined)
    const [draggedTask, setDraggedTask] = useState<Task | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string | "all">("all")
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [includeAssigned, setIncludeAssigned] = useState(false)

    const { userId } = useAuth()
    const taskApi = useMemo(() => taskService(), [])
    const userApi = useMemo(() => userService(), [])

    const fetchTasks = useCallback(async (userId?: string, includeAssignedTasks: boolean = false) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = userId && userId !== "all" 
                ? await taskApi.listTasksByUser(userId, includeAssignedTasks)
                : await taskApi.listTasks()
            setTasks(data)
        } catch (err) {
            setError("Não foi possível carregar as tarefas.")
        } finally {
            setIsLoading(false)
        }
    }, [taskApi])

    useEffect(() => {
        void fetchTasks(
            selectedUserId === "all" ? undefined : selectedUserId,
            includeAssigned
        )
    }, [fetchTasks, selectedUserId, includeAssigned])

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoadingUsers(true)
            const data = await userApi.listUsers()
            setUsers(data)
        } catch (err) {
            console.error("Erro ao carregar usu\u00e1rios:", err)
        } finally {
            setIsLoadingUsers(false)
        }
    }, [userApi])

    useEffect(() => {
        void fetchUsers()
    }, [fetchUsers])

    const handleDragStart = (task: Task) => {
        setDraggedTask(task)
    }

    const handleDragEnd = () => {
        setDraggedTask(null)
    }

    const handleDrop = async (status: TaskStatus) => {
        if (!draggedTask) return

        const optimisticTask = { ...draggedTask, status }
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === draggedTask.id ? optimisticTask : task)))
        setDraggedTask(null)

        if (!draggedTask.id) {
            return
        }

        try {
            await taskApi.updateTask({
                ...optimisticTask,
                id: draggedTask.id,
                createdById: optimisticTask.createdById ?? userId ?? "",
            })
        } catch (err) {
            setError("Não foi possível atualizar a tarefa.")
            // revert state in case of error
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task.id === draggedTask.id ? { ...draggedTask, status: draggedTask.status } : task)),
            )
        }
    }

    const handleCreateTask = async (newTask: Omit<Task, "id">) => {
        if (!userId) {
            setError("Usuário não autenticado.")
            return
        }

        try {
            await taskApi.createTask({
                ...newTask,
                createdById: userId,
            })
            setIsCreateDialogOpen(false)
            // Reload tasks with current filter
            await fetchTasks(
                selectedUserId === "all" ? undefined : selectedUserId,
                includeAssigned
            )
        } catch (err) {
            setError("Não foi possível criar a tarefa.")
        }
    }

    const getTasksByStatus = (status: TaskStatus) => {
        return tasks.filter((task) => task.status === status)
    }

    const handleTaskClick = (task: Task) => {
        router({ to: `/tarefas/${task.id}`})
    }

    const handleAddTaskToColumn = (status: TaskStatus) => {
        setInitialStatus(status)
        setIsCreateDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        setIsCreateDialogOpen(open)
        if (!open) {
            setInitialStatus(undefined)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-muted-foreground">Carregando tarefas...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="space-y-4 text-center">
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={() => void fetchTasks()} size="sm">
                        Tentar novamente
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Gerenciador de Tarefas</h1>
                        <p className="text-sm text-muted-foreground">Sistema de gestão colaborativo</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* User Filter */}
                        <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-muted-foreground" />
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filtrar por usuário" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {isLoadingUsers ? (
                                        <SelectItem value="loading" disabled>
                                            Carregando...
                                        </SelectItem>
                                    ) : (
                                        users
                                            .filter((user): user is User & { id: string } => Boolean(user.id))
                                            .map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name}
                                                </SelectItem>
                                            ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Include Assigned Checkbox */}
                        {selectedUserId !== "all" && (
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="includeAssigned" 
                                    checked={includeAssigned}
                                    onCheckedChange={(checked) => setIncludeAssigned(checked === true)}
                                />
                                <Label 
                                    htmlFor="includeAssigned" 
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Incluir atribuídas a mim
                                </Label>
                            </div>
                        )}
                        <Button onClick={() => {
                            setInitialStatus(undefined)
                            setIsCreateDialogOpen(true)
                        }} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Tarefa
                        </Button>
                    </div>
                </div>
            </header>

            {/* Kanban Board */}
            <div className="flex flex-1 gap-4 overflow-x-auto p-6">
                {COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        title={column.title}
                        status={column.id}
                        tasks={getTasksByStatus(column.id)}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        isDraggingOver={draggedTask?.status !== column.id}
                        onTaskClick={handleTaskClick}
                        onAddTask={handleAddTaskToColumn}
                    />
                ))}
            </div>

            {/* Create Task Dialog */}
            <CreateTaskDialog
                open={isCreateDialogOpen}
                onOpenChange={handleDialogClose}
                onCreateTask={handleCreateTask}
                initialStatus={initialStatus}
            />
        </div>
    )
}

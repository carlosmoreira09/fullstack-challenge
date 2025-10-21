import {useCallback, useEffect, useMemo, useState} from "react"
import {Plus} from "lucide-react"
import {Button} from "@/components/ui/button"
import {useNavigate} from "@tanstack/react-router";
import {KanbanColumn} from "@/components/tasks/kanban.tsx";
import {CreateTaskDialog} from "@/components/tasks/create-task-dialog.tsx";
import type {Task, TaskStatus} from "@/dto/tasks/task.dto.ts";
import {taskService} from "@/service/task.service.ts";
import {useAuth} from "@/hooks/auth.tsx";

const COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "REVIEW", title: "Review" },
    { id: "DONE", title: "Done" },
]

export function KanbanBoard() {
    const router = useNavigate()
    const [tasks, setTasks] = useState<Task[]>([])
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [draggedTask, setDraggedTask] = useState<Task | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { userId } = useAuth()
    const taskApi = useMemo(() => taskService(), [])

    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await taskApi.listTasks()
            setTasks(data)
        } catch (err) {
            setError("Não foi possível carregar as tarefas.")
        } finally {
            setIsLoading(false)
        }
    }, [taskApi])

    useEffect(() => {
        void fetchTasks()
    }, [fetchTasks])

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
            const createdTask = await taskApi.createTask({
                ...newTask,
                createdById: userId,
            })
            setTasks((prevTasks) => [...prevTasks, createdTask])
            setIsCreateDialogOpen(false)
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
                    <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Tarefa
                    </Button>
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
                    />
                ))}
            </div>

            {/* Create Task Dialog */}
            <CreateTaskDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onCreateTask={handleCreateTask}
            />
        </div>
    )
}

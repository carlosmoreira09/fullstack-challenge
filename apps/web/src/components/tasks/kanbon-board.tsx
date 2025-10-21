import {useState} from "react"
import {Plus} from "lucide-react"
import {Button} from "@/components/ui/button"
import {useNavigate} from "@tanstack/react-router";
import {KanbanColumn} from "@/components/tasks/kanban.tsx";
import {CreateTaskDialog} from "@/components/tasks/create-task-dialog.tsx";
import type {Task, TaskStatus} from "@/dto/tasks/task.dto.ts";

const COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "REVIEW", title: "Review" },
    { id: "DONE", title: "Done" },
]

// Mock initial data
const INITIAL_TASKS: Task[] = [
    {
        id: "1",
        title: "Implementar autenticação JWT",
        description: "Criar sistema de login com tokens de acesso e refresh",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2025-10-25",
        assignees: ["João Silva"],
    },
    {
        id: "2",
        title: "Configurar RabbitMQ",
        description: "Setup do broker de mensagens para comunicação entre microserviços",
        status: "IN_PROGRESS",
        priority: "URGENT",
        dueDate: "2025-10-22",
        assignees: ["Maria Santos", "Pedro Costa"],
    },
    {
        id: "3",
        title: "Criar componentes shadcn/ui",
        description: "Implementar componentes de UI reutilizáveis",
        status: "REVIEW",
        priority: "MEDIUM",
        dueDate: "2025-10-28",
        assignees: ["Ana Lima"],
    },
    {
        id: "4",
        title: "Setup Docker Compose",
        description: "Configurar containers para todos os serviços",
        status: "DONE",
        priority: "HIGH",
        dueDate: "2025-10-20",
        assignees: ["João Silva"],
    },
]

export function KanbanBoard() {
    const router = useNavigate()
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [draggedTask, setDraggedTask] = useState<Task | null>(null)

    const handleDragStart = (task: Task) => {
        setDraggedTask(task)
    }

    const handleDragEnd = () => {
        setDraggedTask(null)
    }

    const handleDrop = (status: TaskStatus) => {
        if (!draggedTask) return

        setTasks((prevTasks) => prevTasks.map((task) => (task.id === draggedTask.id ? { ...task, status } : task)))
        setDraggedTask(null)
    }

    const handleCreateTask = (newTask: Omit<Task, "id">) => {
        const task: Task = {
            ...newTask,
            id: Date.now().toString(),
        }
        setTasks((prevTasks) => [...prevTasks, task])
        setIsCreateDialogOpen(false)
    }

    const getTasksByStatus = (status: TaskStatus) => {
        return tasks.filter((task) => task.status === status)
    }

    const handleTaskClick = (task: Task) => {
        router({ to: `/tasks/${task.id}`})
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

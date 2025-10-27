import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type {Task, TaskStatus} from "@/types";
import {TaskCard} from "@/components/tasks/task-card.tsx";

interface KanbanColumnProps {
    title: string
    status: TaskStatus
    tasks: Task[]
    onDragStart: (task: Task) => void
    onDragEnd: () => void
    onDrop: (status: TaskStatus) => void
    isDraggingOver: boolean
    onTaskClick?: (task: Task) => void
    onAddTask?: (status: TaskStatus) => void
}

export function KanbanColumn({
                                 title,
                                 status,
                                 tasks,
                                 onDragStart,
                                 onDragEnd,
                                 onDrop,
                                 isDraggingOver,
                                 onTaskClick,
                                 onAddTask,
                             }: KanbanColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = () => {
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        onDrop(status)
    }

    return (
        <div className="flex min-w-[320px] flex-1 flex-col">
            {/* Column Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onAddTask?.(status)}
                    title={`Adicionar tarefa em ${title}`}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Tasks Container */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "flex flex-1 flex-col gap-3 rounded-lg border-2 border-dashed bg-muted/20 p-3 transition-colors",
                    isDragOver && isDraggingOver ? "border-primary bg-primary/5" : "border-transparent",
                )}
            >
                {tasks.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-sm text-muted-foreground">Nenhuma tarefa</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onTaskClick} />
                    ))
                )}
            </div>
        </div>
    )
}

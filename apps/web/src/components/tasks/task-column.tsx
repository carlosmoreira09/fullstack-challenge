import type React from 'react'
import type { Task } from '@/types'
import { TaskCard } from '@/components/tasks/task-card.tsx'

interface TaskColumnProps {
  status: Task['status']
  tasks: Array<Task>
  onDragOver: (e: React.DragEvent) => void
  onDrop: (status: Task['status']) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onTaskClick: (task: Task) => void
}

export function TaskColumn({
  tasks,
  onDragStart,
  onDragEnd,
  onTaskClick,
}: TaskColumnProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onClick={() => onTaskClick(task)}
        />
      ))}
    </div>
  )
}

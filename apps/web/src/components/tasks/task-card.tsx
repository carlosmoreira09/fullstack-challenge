import { Calendar } from 'lucide-react'
import type React from 'react'
import type { Task } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onClick?: (task: Task) => void
}

const PRIORITY_CONFIG = {
  LOW: {
    label: 'Baixa',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  MEDIUM: {
    label: 'Média',
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  HIGH: {
    label: 'Alta',
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
  URGENT: {
    label: 'Urgente',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
}

export function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  onClick,
}: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority]

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(task)
    e.currentTarget.classList.add('opacity-50')
  }

  const handleDragEnd = (e: React.DragEvent) => {
    onDragEnd()
    e.currentTarget.classList.remove('opacity-50')
  }

  const handleClick = () => {
    onClick?.(task)
  }

  const getInitials = (name?: string) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className="cursor-grab border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md active:cursor-grabbing"
    >
      {/* Priority Badge */}
      <div className="mb-3 flex items-start justify-between">
        <Badge
          variant="outline"
          className={cn('text-xs font-medium', priorityConfig.className)}
        >
          {priorityConfig.label}
        </Badge>
      </div>

      {/* Task Title */}
      <h4 className="mb-2 font-semibold text-foreground leading-snug text-balance">
        {task.title}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2 text-pretty">
          {task.description}
        </p>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        {/* Deadline */}
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        {/* Assigned Users */}
        <div className="flex items-center gap-1">
          {task.assigneesData && task.assigneesData.length > 0 ? (
            <>
              {task.assigneesData.slice(0, 3).map((user) => (
                <Avatar
                  key={user.id}
                  className="h-6 w-6 border border-border"
                  title={user.name || 'Unknown'}
                >
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assigneesData.length > 3 && (
                <span className="ml-1 text-xs text-muted-foreground">
                  +{task.assigneesData.length - 3}
                </span>
              )}
            </>
          ) : task.assignees.length > 0 ? (
            <>
              {task.assignees.slice(0, 3).map((userId, index) => (
                <Avatar
                  key={index}
                  className="h-6 w-6 border border-border"
                  title={userId}
                >
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    ??
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignees.length > 3 && (
                <span className="ml-1 text-xs text-muted-foreground">
                  +{task.assignees.length - 3}
                </span>
              )}
            </>
          ) : (
            <>
              <Badge className="text-[10px] bg-primary/10 text-primary">
                Ninguém assignado
              </Badge>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

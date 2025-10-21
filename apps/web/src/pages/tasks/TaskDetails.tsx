import {createRoute, useNavigate} from "@tanstack/react-router"
import {useEffect, useMemo, useState} from "react"
import { ArrowLeft, Calendar, Clock, Flag, MessageSquare, History, User, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type {Task, TaskComment, TaskHistoryEntry, TaskPriority} from "@/dto/tasks/task.dto.ts";
import {authenticatedRoute} from "@/components/ProtectedRoute.tsx";
import {taskService} from "@/service/task.service.ts";

const PRIORITY_CONFIG: Record<
    TaskPriority,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: string }
> = {
    LOW: { label: "Baixa", variant: "secondary", icon: "🟢" },
    MEDIUM: { label: "Média", variant: "outline", icon: "🟡" },
    HIGH: { label: "Alta", variant: "default", icon: "🟠" },
    URGENT: { label: "Urgente", variant: "destructive", icon: "🔴" },
}

const STATUS_LABELS = {
    TODO: "A Fazer",
    IN_PROGRESS: "Em Progresso",
    REVIEW: "Em Revisão",
    DONE: "Concluído",
}
export const taskDetailsRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/tarefas/$taskId',
    component: TaskDetails,
})

function TaskDetails() {
    const navigate = useNavigate()
    const { taskId } = taskDetailsRoute.useParams()
    const [task, setTask] = useState<Task | null>(null)
    const [comments, setComments] = useState<TaskComment[]>([])
    const [history] = useState<TaskHistoryEntry[]>([])
    const [newComment, setNewComment] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const taskApi = useMemo(() => taskService(), [])

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const data = await taskApi.getTaskById(taskId)
                if (!data) {
                    setError("Tarefa não encontrada.")
                    setTask(null)
                    return
                }
                setTask(data)
            } catch (err) {
                setError("Não foi possível carregar a tarefa.")
            } finally {
                setIsLoading(false)
            }
        }

        void fetchTask()
    }, [taskApi, taskId])

    const handleAddComment = () => {
        if (!newComment.trim() || !task) return

        const comment: TaskComment = {
            id: `c${Date.now()}`,
            taskId: task.id,
            authorId: "current-user",
            authorName: "Você",
            content: newComment,
            createdAt: new Date().toISOString(),
        }

        setComments([...comments, comment])
        setNewComment("")
    }

    const formatDate = (dateString?: string) => {
       if(!dateString)  return 'Sem data'
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const renderHistoryChange = (entry: TaskHistoryEntry) => {
        switch (entry.changeType) {
            case "CREATE":
                return <span className="text-muted-foreground">criou a tarefa</span>
            case "ASSIGN":
                return (
                    <span className="text-muted-foreground">
            atribuiu a tarefa para{" "}
                        <span className="font-medium text-foreground">{entry.after.assignees.join(", ")}</span>
          </span>
                )
            case "STATUS_CHANGE":
                return (
                    <span className="text-muted-foreground">
            alterou o status de{" "}
                        <span className="font-medium text-foreground">
              {STATUS_LABELS[entry.before.status as keyof typeof STATUS_LABELS]}
            </span>{" "}
                        para{" "}
                        <span className="font-medium text-foreground">
              {STATUS_LABELS[entry.after.status as keyof typeof STATUS_LABELS]}
            </span>
          </span>
                )
            case "COMMENT":
                return <span className="text-muted-foreground">adicionou um comentário</span>
            case "UPDATE":
                return <span className="text-muted-foreground">atualizou a tarefa</span>
            default:
                return <span className="text-muted-foreground">realizou uma alteração</span>
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Carregando tarefa...</p>
            </div>
        )
    }

    if (error || !task) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">{error ?? "Tarefa não encontrada."}</p>
                <Button variant="outline" onClick={() => navigate({ to: "/" })}>
                    Voltar para o quadro
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-6 py-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })} className="mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o quadro
                    </Button>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold text-foreground">{task.title}</h1>
                            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Criado por {task.createdByData?.name ?? task.createdById ?? "-"}</span>
                                <span>•</span>
                                <span>{formatDate(task.createdAt)}</span>
                            </div>
                        </div>
                        <Badge variant={PRIORITY_CONFIG[task.priority].variant} className="text-sm">
                            {PRIORITY_CONFIG[task.priority].icon} {PRIORITY_CONFIG[task.priority].label}
                        </Badge>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalhes da Tarefa</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Descrição</h3>
                                    <p className="text-sm leading-relaxed text-foreground">{task.description}</p>
                                </div>

                                <Separator />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Flag className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Status</p>
                                            <p className="text-sm font-medium">{STATUS_LABELS[task.status]}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Prazo</p>
                                            <p className="text-sm font-medium">{task.dueDate ? formatDate(task.dueDate) : "Sem prazo"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Clock className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Última atualização</p>
                                            <p className="text-sm font-medium">{formatDate(task.updatedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Comentários ({comments.length})
                                </CardTitle>
                                <CardDescription>Discussão e atualizações sobre a tarefa</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                                        {getInitials(comment.authorName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{comment.authorName}</span>
                                                        <span className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-foreground">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <Separator className="my-4" />

                                <div className="space-y-3">
                                    <Textarea
                                        placeholder="Adicione um comentário..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="min-h-[100px] resize-none"
                                    />
                                    <div className="flex justify-end">
                                        <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm">
                                            <Send className="mr-2 h-4 w-4" />
                                            Enviar comentário
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="h-4 w-4" />
                                    Responsáveis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {task.assigneesData && task.assigneesData.length > 0 ? (
                                        task.assigneesData.map((user) => (
                                            <div key={user.id} className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Nenhum responsável atribuído</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <History className="h-4 w-4" />
                                    Histórico
                                </CardTitle>
                                <CardDescription>Registro de alterações</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[500px] pr-4">
                                    <div className="space-y-4">
                                        {history.map((entry, index) => (
                                            <div key={entry.id} className="relative flex gap-3 pb-4">
                                                {index !== history.length - 1 && (
                                                    <div className="absolute left-4 top-10 h-full w-px bg-border" />
                                                )}
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-muted text-xs">{getInitials(entry.actorName)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="text-sm">
                                                        <span className="font-medium">{entry.actorName}</span> {renderHistoryChange(entry)}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

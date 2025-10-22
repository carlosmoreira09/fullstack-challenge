import {createRoute, useNavigate} from "@tanstack/react-router"
import {useEffect, useMemo, useState} from "react"
import { ArrowLeft, Calendar, Clock, Flag, MessageSquare, History, User, Send, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {type Task, type TaskComment, type TaskHistoryEntry, TaskPriority} from "@taskmanagerjungle/types";
import {authenticatedRoute} from "@/components/ProtectedRoute.tsx";
import {taskService} from "@/service/task.service.ts";
import {commentService} from "@/service/comment.service.ts";
import {CommentCard} from "@/components/tasks/CommentCard.tsx";
import {useAuth} from "@/hooks/auth.tsx";
import {AddAssigneesDialog} from "@/components/tasks/AddAssigneesDialog.tsx";
import {UpdateTaskDto} from "@taskmanagerjungle/types";
import {taskHistoryService} from "@/service/taskHistory.service.ts";

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
    const { userId, decoded } = useAuth()
    const [task, setTask] = useState<Task | null>(null)
    const [comments, setComments] = useState<TaskComment[]>([])
    const [history, setHistory] = useState<TaskHistoryEntry[]>([])
    const [newComment, setNewComment] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isAssigneesDialogOpen, setIsAssigneesDialogOpen] = useState(false)

    const taskApi = useMemo(() => taskService(), [])
    const commentApi = useMemo(() => commentService(), [])
    const historyApi = useMemo(() => taskHistoryService(), [])
    const isAdmin = decoded?.role === 'ADMIN'

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

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setIsLoadingComments(true)
                const data = await commentApi.getCommentsByTask(taskId)
                setComments(data)
            } catch (err) {
                console.error("Erro ao carregar comentários:", err)
            } finally {
                setIsLoadingComments(false)
            }
        }

        void fetchComments()
    }, [commentApi, taskId])

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoadingHistory(true)
                const data = await historyApi.getHistoryByTask(taskId)
                setHistory(data)
            } catch (err) {
                console.error("Erro ao carregar histórico:", err)
            } finally {
                setIsLoadingHistory(false)
            }
        }

        void fetchHistory()
    }, [historyApi, taskId])

    const handleAddComment = async () => {
        if (!newComment.trim() || !task) return

        try {
            const comment = await commentApi.createComment({
                taskId: task.id!,
                content: newComment,
            })
            setComments([...comments, comment])
            setNewComment("")

            const updatedHistory = await historyApi.getHistoryByTask(taskId)
            setHistory(updatedHistory)
        } catch (err) {
            console.error("Erro ao adicionar comentário:", err)
        }
    }

    const handleEditComment = async (commentId: string, content: string) => {
        try {
            const updatedComment = await commentApi.updateComment(commentId, { content })
            setComments(comments.map(c => c.id === commentId ? updatedComment : c))

            const updatedHistory = await historyApi.getHistoryByTask(taskId)
            setHistory(updatedHistory)
        } catch (err) {
            console.error("Erro ao editar comentário:", err)
            throw err
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        try {
            await commentApi.deleteComment(commentId)
            setComments(comments.filter(c => c.id !== commentId))

            const updatedHistory = await historyApi.getHistoryByTask(taskId)
            setHistory(updatedHistory)
        } catch (err) {
            console.error("Erro ao deletar comentário:", err)
            throw err
        }
    }

    const handleUpdateAssignees = async (assigneeIds: string[]) => {
        if (!task) return

        const updateTask: UpdateTaskDto = {
            id: task.id!,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            assignees: assigneeIds,
            createdById: userId
        }
        try {
            await taskApi.updateTask(updateTask)

            // Refresh task data
            const updatedTask = await taskApi.getTaskById(task.id!)
            if (updatedTask) {
                setTask(updatedTask)
            }
        } catch (err) {
            console.error("Erro ao atualizar responsáveis:", err)
            throw err
        }
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
        switch (entry.action) {
            case "CREATED":
                return <span className="text-muted-foreground">criou a tarefa</span>
            case "ASSIGNEE_ADDED":
                return (
                    <span className="text-muted-foreground">
                        adicionou um responsável
                    </span>
                )
            case "ASSIGNEE_REMOVED":
                return (
                    <span className="text-muted-foreground">
                        removeu um responsável
                    </span>
                )
            case "STATUS_CHANGED":
                return (
                    <span className="text-muted-foreground">
                        alterou o status de{" "}
                        <span className="font-medium text-foreground">
                            {entry.oldValue?.status ? STATUS_LABELS[entry.oldValue.status as keyof typeof STATUS_LABELS] : "N/A"}
                        </span>{" "}
                        para{" "}
                        <span className="font-medium text-foreground">
                            {entry.newValue?.status ? STATUS_LABELS[entry.newValue.status as keyof typeof STATUS_LABELS] : "N/A"}
                        </span>
                    </span>
                )
            case "PRIORITY_CHANGED":
                return (
                    <span className="text-muted-foreground">
                        alterou a prioridade
                    </span>
                )
            case "DUE_DATE_CHANGED":
                return (
                    <span className="text-muted-foreground">
                        alterou a data de vencimento
                    </span>
                )
            case "COMMENT_ADDED":
                return (
                    <span className="text-muted-foreground">
                        adicionou um comentário:{" "}
                        <span className="italic text-foreground">
                            "{entry.newValue?.content ? String(entry.newValue.content).substring(0, 50) : ""}..."
                        </span>
                    </span>
                )
            case "COMMENT_UPDATED":
                return (
                    <span className="text-muted-foreground">
                        editou um comentário
                    </span>
                )
            case "COMMENT_DELETED":
                return (
                    <span className="text-muted-foreground">
                        deletou um comentário
                    </span>
                )
            case "UPDATED":
                return <span className="text-muted-foreground">atualizou a tarefa</span>
            case "DELETED":
                return <span className="text-muted-foreground text-red-500">deletou a tarefa</span>
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
                                <ScrollArea className="h-[120px] pr-4">
                                    {isLoadingComments ? (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-sm text-muted-foreground">Carregando comentários...</p>
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Seja o primeiro!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {comments.map((comment) => (
                                                <CommentCard
                                                    key={comment.id}
                                                    comment={comment}
                                                    currentUserId={userId || ""}
                                                    isAdmin={isAdmin}
                                                    onEdit={handleEditComment}
                                                    onDelete={handleDeleteComment}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>

                                <Separator className="my-4" />

                                <div className="space-y-3">
                                    <Textarea
                                        placeholder="Adicione um comentário..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="min-h-[50px] resize-none"
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
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-4 w-4" />
                                        Responsáveis
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setIsAssigneesDialogOpen(true)}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
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
                                    {isLoadingHistory ? (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-sm text-muted-foreground">Carregando histórico...</p>
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-sm text-muted-foreground">Nenhum histórico disponível</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {history.map((entry, index) => (
                                                <div key={entry.id} className="relative flex gap-3 pb-4">
                                                    {index !== history.length - 1 && (
                                                        <div className="absolute left-4 top-10 h-full w-px bg-border" />
                                                    )}
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-muted text-xs">{getInitials(entry.userName)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="text-sm">
                                                            <span className="font-medium">{entry.userName}</span> {renderHistoryChange(entry)}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <AddAssigneesDialog
                open={isAssigneesDialogOpen}
                onOpenChange={setIsAssigneesDialogOpen}
                currentAssignees={task.assignees}
                onSave={handleUpdateAssignees}
            />
        </div>
    )
}

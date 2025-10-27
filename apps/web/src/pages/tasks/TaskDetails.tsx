import {createRoute, useNavigate} from "@tanstack/react-router"
import {useEffect, useMemo, useState} from "react"
import { ArrowLeft, Calendar, Clock, Flag, MessageSquare, History, User, Send, UserPlus, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"
import {type Task, type TaskComment, type TaskHistoryEntry, TaskPriority, TaskStatus} from "@/types";
import {authenticatedRoute} from "@/components/ProtectedRoute.tsx";
import {taskService} from "@/service/task.service.ts";
import {commentService} from "@/service/comment.service.ts";
import {CommentCard} from "@/components/tasks/CommentCard.tsx";
import {useAuth} from "@/hooks/auth.tsx";
import {AddAssigneesDialog} from "@/components/tasks/AddAssigneesDialog.tsx";
import {type UpdateTaskDto} from "@/types";
import {taskHistoryService} from "@/service/taskHistory.service.ts";
import {TaskDetailsSkeleton} from "@/components/tasks/TaskDetailsSkeleton.tsx";

const PRIORITY_CONFIG: Record<
    TaskPriority,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: string }
> = {
    LOW: { label: "Baixa", variant: "secondary", icon: "🟢" },
    MEDIUM: { label: "Média", variant: "outline", icon: "🟡" },
    HIGH: { label: "Alta", variant: "default", icon: "🟠" },
    URGENT: { label: "Urgente", variant: "destructive", icon: "🔴" },
}

const STATUS_LABELS: Record<TaskStatus, string> = {
    TODO: "A Fazer",
    IN_PROGRESS: "Em Progresso",
    REVIEW: "Em Revisão",
    DONE: "Concluído",
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; variant: "default" | "secondary" | "outline" | "success" }> = {
    TODO: { label: "A Fazer", variant: "secondary" },
    IN_PROGRESS: { label: "Em Progresso", variant: "default" },
    REVIEW: { label: "Em Revisão", variant: "outline" },
    DONE: { label: "Concluído", variant: "success" },
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
    const [isEditingDetails, setIsEditingDetails] = useState(false)
    const [editedTitle, setEditedTitle] = useState("")
    const [editedDescription, setEditedDescription] = useState<string>("")
    const [editedDueDate, setEditedDueDate] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalComments, setTotalComments] = useState(0)
    const commentsPerPage = 5

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
                const response = await commentApi.getCommentsByTask(taskId, currentPage, commentsPerPage)
                setComments(response.data)
                setTotalPages(response.meta.totalPages)
                setTotalComments(response.meta.total)
            } catch (err) {
                console.error("Erro ao carregar comentários:", err)
            } finally {
                setIsLoadingComments(false)
            }
        }

        void fetchComments()
    }, [commentApi, taskId, currentPage])

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
            await commentApi.createComment({
                taskId: task.id!,
                content: newComment,
            })
            setNewComment("")
            
            const response = await commentApi.getCommentsByTask(taskId, currentPage, commentsPerPage)
            setComments(response.data)
            setTotalPages(response.meta.totalPages)
            setTotalComments(response.meta.total)

            const updatedHistory = await historyApi.getHistoryByTask(taskId)
            setHistory(updatedHistory)
            console.log('💬 Comment added, notification will arrive via WebSocket')
        } catch (err) {
            console.error("Erro ao adicionar comentário:", err)
        }
    }

    const handleEditComment = async (commentId: string, content: string) => {
        try {
            await commentApi.updateComment(commentId, { content })
            
            const response = await commentApi.getCommentsByTask(taskId, currentPage, commentsPerPage)
            setComments(response.data)

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
            
            const response = await commentApi.getCommentsByTask(taskId, currentPage, commentsPerPage)
            setComments(response.data)
            setTotalPages(response.meta.totalPages)
            setTotalComments(response.meta.total)

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

            const updatedTask = await taskApi.getTaskById(task.id!)
            if (updatedTask) {
                setTask(updatedTask)
            }

            const updatedHistory = await historyApi.getHistoryByTask(taskId)
            setHistory(updatedHistory)

            console.log('👥 Assignees updated, notification will arrive via WebSocket')
        } catch (err) {
            console.error("Erro ao atualizar responsáveis:", err)
            throw err
        }
    }

    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (!task) return

        const updateTask: UpdateTaskDto = {
            id: task.id!,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: newStatus,
            dueDate: task.dueDate,
            assignees: task.assignees,
            createdById: userId
        }

        try {
            await taskApi.updateTask(updateTask)

            setTask({ ...task, status: newStatus })

            const updatedHistory = await historyApi.getHistoryByTask(taskId)
            setHistory(updatedHistory)
            console.log('📊 Status changed, notification will arrive via WebSocket')
        } catch (err) {
            console.error("Erro ao atualizar status:", err)
        }
    }

    const handlePriorityChange = async (newPriority: TaskPriority) => {
        if (!task) return

        const updateTask: UpdateTaskDto = {
            id: task.id!,
            title: task.title,
            description: task.description,
            priority: newPriority,
            status: task.status,
            dueDate: task.dueDate,
            assignees: task.assignees,
            createdById: userId
        }

        try {
            await taskApi.updateTask(updateTask)

            setTask({ ...task, priority: newPriority })

            const updatedHistory = await historyApi.getHistoryByTask(taskId)
            setHistory(updatedHistory)
        } catch (err) {
            console.error("Erro ao atualizar prioridade:", err)
        }
    }

    const handleStartEditing = () => {
        if (!task) return

        setEditedTitle(task.title)
        setEditedDescription(task.description || '')
        setEditedDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "")
        setIsEditingDetails(true)
    }

    const handleCancelEditing = () => {
        setIsEditingDetails(false)
        setEditedTitle("")
        setEditedDescription("")
        setEditedDueDate("")
    }

    const handleSaveDetails = async () => {
        if (!task || !editedTitle.trim()) return

        const updateTask: UpdateTaskDto = {
            id: task.id!,
            title: editedTitle.trim(),
            description: editedDescription.trim(),
            priority: task.priority,
            status: task.status,
            dueDate: editedDueDate || undefined,
            assignees: task.assignees,
            createdById: userId
        }

        try {
            await taskApi.updateTask(updateTask)
            setTask({
                ...task,
                title: editedTitle.trim(),
                description: editedDescription.trim(),
                dueDate: editedDueDate || undefined
            })

            const updatedHistory = await historyApi.getHistoryByTask(taskId)
            setHistory(updatedHistory)

            setIsEditingDetails(false)
        } catch (err) {
            console.error("Erro ao atualizar detalhes:", err)
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
        return <TaskDetailsSkeleton />
    }

    if (error || !task) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">{error ?? "Tarefa não encontrada."}</p>
                <Button variant="outline" onClick={() => navigate({ to: "/tarefas" })}>
                    Voltar para o quadro
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-6 py-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/tarefas" })} className="mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o quadro
                    </Button>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            {isEditingDetails ? (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Título</p>
                                    <Input
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        className="text-lg font-semibold h-9"
                                        placeholder="Título da tarefa"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-2xl font-semibold text-foreground">{task.title}</h1>
                            )}
                            {!isEditingDetails && (
                                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>Criado por {task.createdByData?.name ?? task.createdById ?? "-"}</span>
                                    <span>•</span>
                                    <span>{formatDate(task.createdAt)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-shrink-0">
                            <p className="text-xs text-muted-foreground mb-2 text-right">Prioridade</p>
                            <Select value={task.priority} onValueChange={(value) => handlePriorityChange(value as TaskPriority)}>
                                <SelectTrigger className="h-9 w-[160px]">
                                    <SelectValue>
                                        <span className="flex items-center gap-2">
                                            <span>{PRIORITY_CONFIG[task.priority].icon}</span>
                                            <span>{PRIORITY_CONFIG[task.priority].label}</span>
                                        </span>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TaskPriority.LOW}>
                                        <span className="flex items-center gap-2">
                                            <span>{PRIORITY_CONFIG[TaskPriority.LOW].icon}</span>
                                            <span>{PRIORITY_CONFIG[TaskPriority.LOW].label}</span>
                                        </span>
                                    </SelectItem>
                                    <SelectItem value={TaskPriority.MEDIUM}>
                                        <span className="flex items-center gap-2">
                                            <span>{PRIORITY_CONFIG[TaskPriority.MEDIUM].icon}</span>
                                            <span>{PRIORITY_CONFIG[TaskPriority.MEDIUM].label}</span>
                                        </span>
                                    </SelectItem>
                                    <SelectItem value={TaskPriority.HIGH}>
                                        <span className="flex items-center gap-2">
                                            <span>{PRIORITY_CONFIG[TaskPriority.HIGH].icon}</span>
                                            <span>{PRIORITY_CONFIG[TaskPriority.HIGH].label}</span>
                                        </span>
                                    </SelectItem>
                                    <SelectItem value={TaskPriority.URGENT}>
                                        <span className="flex items-center gap-2">
                                            <span>{PRIORITY_CONFIG[TaskPriority.URGENT].icon}</span>
                                            <span>{PRIORITY_CONFIG[TaskPriority.URGENT].label}</span>
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Detalhes da Tarefa</CardTitle>
                                    {!isEditingDetails ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleStartEditing}
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCancelEditing}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Cancelar
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={handleSaveDetails}
                                                disabled={!editedTitle.trim()}
                                            >
                                                <Check className="h-4 w-4 mr-2" />
                                                Salvar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Descrição</h3>
                                    {isEditingDetails ? (
                                        <Textarea
                                            value={editedDescription}
                                            onChange={(e) => setEditedDescription(e.target.value)}
                                            className="min-h-[100px] resize-none"
                                            placeholder="Descrição da tarefa"
                                        />
                                    ) : (
                                        <p className="text-sm leading-relaxed text-foreground">{task.description}</p>
                                    )}
                                </div>

                                <Separator />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Flag className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                                            <Select value={task.status} onValueChange={(value) => handleStatusChange(value as TaskStatus)}>
                                                <SelectTrigger className="h-8 w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={TaskStatus.TODO}>
                                                        {STATUS_CONFIG[TaskStatus.TODO].label}
                                                    </SelectItem>
                                                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                                                        {STATUS_CONFIG[TaskStatus.IN_PROGRESS].label}
                                                    </SelectItem>
                                                    <SelectItem value={TaskStatus.REVIEW}>
                                                        {STATUS_CONFIG[TaskStatus.REVIEW].label}
                                                    </SelectItem>
                                                    <SelectItem value={TaskStatus.DONE}>
                                                        {STATUS_CONFIG[TaskStatus.DONE].label}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-1">Prazo</p>
                                            {isEditingDetails ? (
                                                <Input
                                                    type="date"
                                                    value={editedDueDate}
                                                    onChange={(e) => setEditedDueDate(e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                <p className="text-sm font-medium">{task.dueDate ? formatDate(task.dueDate) : "Sem prazo"}</p>
                                            )}
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
                                    Comentários ({totalComments})
                                </CardTitle>
                                <CardDescription>Discussão e atualizações sobre a tarefa</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isLoadingComments ? (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-sm text-muted-foreground">Carregando comentários...</p>
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Seja o primeiro!</p>
                                        </div>
                                    ) : (
                                        <>
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
                                            
                                            {totalPages > 1 && (
                                                <Pagination>
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                size={"sm"}
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                                                                }}
                                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                            />
                                                        </PaginationItem>
                                                        
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                            if (
                                                                page === 1 ||
                                                                page === totalPages ||
                                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                                            ) {
                                                                return (
                                                                    <PaginationItem key={page}>
                                                                        <PaginationLink
                                                                            size={"sm"}
                                                                            href="#"
                                                                            onClick={(e) => {
                                                                                e.preventDefault()
                                                                                setCurrentPage(page)
                                                                            }}
                                                                            isActive={currentPage === page}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            {page}
                                                                        </PaginationLink>
                                                                    </PaginationItem>
                                                                )
                                                            } else if (
                                                                page === currentPage - 2 ||
                                                                page === currentPage + 2
                                                            ) {
                                                                return (
                                                                    <PaginationItem key={page}>
                                                                        <PaginationEllipsis />
                                                                    </PaginationItem>
                                                                )
                                                            }
                                                            return null
                                                        })}
                                                        
                                                        <PaginationItem>
                                                            <PaginationNext
                                                                size={"sm"}
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                                                                }}
                                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                            />
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            )}
                                        </>
                                    )}
                                </div>

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

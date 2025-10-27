import { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { TaskComment } from "@/types";

interface CommentCardProps {
    comment: TaskComment;
    currentUserId: string;
    isAdmin: boolean;
    onEdit: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
}

export function CommentCard({ comment, currentUserId, isAdmin, onEdit, onDelete }: CommentCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isAuthor = comment.authorId === currentUserId;
    const canEdit = isAuthor;
    const canDelete = isAdmin || isAuthor;

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim() || editContent === comment.content) {
            setIsEditing(false);
            setEditContent(comment.content);
            return;
        }

        try {
            setIsSaving(true);
            await onEdit(comment.id, editContent);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating comment:", error);
            setEditContent(comment.content);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await onDelete(comment.id);
        } catch (error) {
            console.error("Error deleting comment:", error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex gap-3 group">
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {getInitials(comment.authorName)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    {!isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setIsEditing(true)}
                                    disabled={isDeleting}
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[80px] resize-none text-sm"
                            disabled={isSaving}
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={!editContent.trim() || isSaving}
                                className="h-7"
                            >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Salvar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="h-7"
                            >
                                <X className="mr-1 h-3.5 w-3.5" />
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{comment.content}</p>
                )}
            </div>
        </div>
    );
}

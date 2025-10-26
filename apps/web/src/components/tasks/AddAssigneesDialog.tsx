import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { userService } from "@/service/user.service.ts";
import type { User } from "@/dto/users/users.dto.ts";

interface AddAssigneesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAssignees: string[];
    onSave: (assigneeIds: string[]) => Promise<void>;
}

export function AddAssigneesDialog({ open, onOpenChange, currentAssignees, onSave }: AddAssigneesDialogProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>(currentAssignees);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const usersApi = useMemo(() => userService(), []);

    useEffect(() => {
        if (open) {
            setSelectedAssignees(currentAssignees);
            fetchUsers();
        }
    }, [open, currentAssignees]);

    const fetchUsers = async () => {
        try {
            setIsLoadingUsers(true);
            setError(null);
            const response = await usersApi.listUsers();
            setUsers(response);
        } catch (err) {
            setError("Não foi possível carregar os usuários.");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleToggleAssignee = (userId?: string) => {
        if(!userId) return;
        setSelectedAssignees((prev) => {
            const isSelected = prev.includes(userId);
            return isSelected
                ? prev.filter((id) => id !== userId)
                : [...prev, userId];
        });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await onSave(selectedAssignees);
            onOpenChange(false);
        } catch (err) {
            console.error("Error saving assignees:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Responsáveis</DialogTitle>
                    <DialogDescription>
                        Selecione os usuários que serão responsáveis por esta tarefa.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-muted-foreground">Carregando usuários...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-muted-foreground">Nenhum usuário disponível.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => handleToggleAssignee(user.id)}
                                    >
                                        <Checkbox
                                            checked={selectedAssignees.includes(user.id ? user.id : '')}
                                            onCheckedChange={() => handleToggleAssignee(user.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col flex-1">
                                            <span className="text-sm font-medium">{user?.name}</span>
                                            <span className="text-xs text-muted-foreground">{user?.email}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || isLoadingUsers}>
                        {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

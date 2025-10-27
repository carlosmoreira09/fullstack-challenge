import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema, type CreateCommentFormData } from "@/schemas/comment.schema";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommentFormProps {
    taskId: string;
    authorId: string;
    onSubmit: (data: CreateCommentFormData) => Promise<void>;
}

export function CommentForm({ taskId, authorId, onSubmit }: CommentFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateCommentFormData>({
        resolver: zodResolver(createCommentSchema),
        defaultValues: {
            taskId,
            authorId,
            content: "",
        },
    });

    const handleFormSubmit = async (data: CreateCommentFormData) => {
        await onSubmit(data);
        reset({ taskId, authorId, content: "" });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
            <div className="space-y-2">
                <Textarea
                    placeholder="Escreva seu comentário..."
                    {...register("content")}
                    className={`min-h-[50px] resize-none ${errors.content ? "border-red-500" : ""}`}
                />
                {errors.content && (
                    <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
            </div>
            <div className="flex justify-end">
                <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    size="sm"
                >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Enviando..." : "Enviar comentário"}
                </Button>
            </div>
        </form>
    );
}

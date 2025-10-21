import {KanbanBoard} from "@/components/tasks/kanbon-board.tsx";
import {createRoute} from "@tanstack/react-router";
import {authenticatedRoute} from "@/components/ProtectedRoute.tsx";

export const tasksRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/tarefas',
    component: ListTasks,
})

function ListTasks() {
    return (
        <div>
            <KanbanBoard />
        </div>
    )
}
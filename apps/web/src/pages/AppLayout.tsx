import React from "react";
import Header from "@/components/Header.tsx";
import { Outlet } from "@tanstack/react-router";

const AppLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="border-t py-4 px-6 bg-background">
                <div className="text-center text-sm text-muted-foreground">
                    &copy; 2025 TaskManagerJungle. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
export default AppLayout;
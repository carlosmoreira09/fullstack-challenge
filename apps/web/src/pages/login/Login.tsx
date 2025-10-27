import {useNavigate} from "@tanstack/react-router";
import {useAuth} from "@/hooks/auth.tsx";
import {useEffect, useState} from "react";
import type {DecodedToken} from "@/types";
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie'
import {ArrowLeft} from "lucide-react";
import {toast} from "sonner";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import type {LoginData} from "@/dto/auth/auth.dto.ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";

export default function Login() {
    const navigate = useNavigate();
    const auth = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
    });

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = Cookies.get('token');
                if (token) {
                    const decoded: DecodedToken = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        auth.logout();
                    }
                }
            } catch (error) {
                auth.logout();
            }
        };

        checkToken().then();
    }, []);

    const onSubmit = async (data: LoginFormData) => {
        const loginData: LoginData = {
            username: data.username,
            password: data.password
        }
        try {
            setIsLoading(true);
            const response = await auth.login(loginData);
            if (response?.token) {
                toast.success('Login realizado com sucesso!');
                navigate({ to: '/' });
            } else {
                toast.error('Falha na autenticação. Verifique suas credenciais.');
            }
        } catch (error) {
            toast.error('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="flex flex-row absolute top-5 left-10 text-2xl cursor-pointer text-foreground">
                <div className="mt-2">
                    <ArrowLeft onClick={() => navigate({to: '/'})} className="hover:text-primary transition"/>
                </div>
            </div>
            <div
                className="w-full rounded-xl max-w-md p-8 space-y-8 bg-card shadow-lg border border-border">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">Área Admin</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Input
                            type="username"
                            placeholder="E-mail"
                            {...register('username')}
                            className={`w-full ${errors.username ? 'border-red-500' : ''}`}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Senha"
                            {...register('password')}
                            className={`w-full ${errors.password ? 'border-red-500' : ''}`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full px-4 py-2 text-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
            </div>
            <Toaster position="top-right"/>
        </div>
    );
}
import {useNavigate} from "@tanstack/react-router";
import {useAuth} from "@/hooks/auth.tsx";
import React, {useEffect, useState} from "react";
import type {DecodedToken, LoginData} from "@/dto/auth/auth.dto.ts";
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie'
import {ArrowLeft} from "lucide-react";
import {toast} from "sonner";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let hasErrors = false;
        const newErrors = {
            email: '',
            password: ''
        };

        if (!formData.email) {
            newErrors.email = 'E-mail é obrigatório';
            hasErrors = true;
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
            hasErrors = true;
        }

        setErrors(newErrors);

        if (hasErrors) return;
        const loginData: LoginData = {
            username: formData.email,
            password: formData.password
        }
        try {
            setIsLoading(true);
            const response = await auth.login(     loginData);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center light:bg-gray-100">
            <div className="flex flex-row absolute top-5 left-10 text-2xl cursor-pointer">
                <div className="mt-2">
                    <ArrowLeft onClick={() => navigate({to: '/'})}/>
                </div>
            </div>
            <div
                className="w-full rounded-xl max-w-md p-8 space-y-8 bg-background dark:bg-white shadow-md dark:shadow-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary dark:text-black">Área Admin</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Input
                            type="email"
                            name="email"
                            placeholder="E-mail"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full dark:placeholder:text-black text-black ${errors.email ? 'border-red-500' : ''}`}
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="password"
                            name="password"
                            placeholder="Senha"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full dark:placeholder:text-black text-black ${errors.password ? 'border-red-500' : ''}`}
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full px-4 py-2 text-lg bg-orange-500 hover:bg-orange-600 text-gray-50 dark:text-gray-50"
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
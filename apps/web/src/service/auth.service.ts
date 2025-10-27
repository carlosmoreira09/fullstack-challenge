import apiClient from "@/lib/interceptor.ts";
import Cookies from "js-cookie";
import type {AuthResponse, LoginDTO} from "@/types";


export const authService = () => {
    const login = async (loginData: LoginDTO): Promise<AuthResponse | null> => {
        try {
            const response = await apiClient.post<AuthResponse>('/auth/login', loginData);
            return response.data ?? null;
        } catch (error) {
            return null;
        }
    };

    const refresh = async (): Promise<AuthResponse | null> => {
        const refreshToken = Cookies.get('refreshToken');
        if(!refreshToken) {
            return null;
        }

        try {
            const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
            return response.data ?? null;
        } catch (error) {
            return null;
        }
    };

    return {
        login,
        refresh,
    }
}
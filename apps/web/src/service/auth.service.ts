import apiClient from "@/interceptor/interceptor.ts";
import Cookies from "js-cookie";
import type {AuthResponse, LoginData} from "@/dto/auth/auth.dto.ts";


export const authService = () => {
    const login = async (loginData: LoginData): Promise<AuthResponse | null> => {
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
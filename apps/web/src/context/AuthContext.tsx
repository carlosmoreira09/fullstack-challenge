import React, { useCallback, useEffect, useMemo, useState } from "react";
import {AuthContext} from "@/context/context.ts";
import type {AuthResponse, DecodedToken, LoginData} from "@/dto/auth/auth.dto.ts";
import {authService} from "@/service/auth.service.ts";
import {jwtDecode} from "jwt-decode";
import Cookies from "js-cookie";

export type Props = {
    children?: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
    const [decoded, setDecoded] = useState<DecodedToken | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const loginService = useMemo(() => authService(), []);

    const handleAuthSuccess = useCallback((response: AuthResponse) => {
        const decodedToken = jwtDecode<DecodedToken>(response.token);
        setDecoded(decodedToken);
        setUserId(decodedToken.userId);
        setIsAuthenticated(true);

        Cookies.set('token', response.token);
        Cookies.set('refreshToken', response.refreshToken);
    }, []);

    const clearAuthState = useCallback(() => {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        setDecoded(null);
        setUserId(null);
        setIsAuthenticated(false);
    }, []);

    const restoreSessionFromCookies = useCallback(() => {
        const token = Cookies.get('token');
        if(!token) {
            clearAuthState();
            return;
        }

        try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            if(decodedToken.exp * 1000 < Date.now()) {
                clearAuthState();
                return;
            }
            setDecoded(decodedToken);
            setUserId(decodedToken.userId);
            setIsAuthenticated(true);
        } catch (error) {
            clearAuthState();
        }
    }, [clearAuthState]);

    useEffect(() => {
        restoreSessionFromCookies();
    }, [restoreSessionFromCookies]);

    const login = useCallback(async (logindData: LoginData) => {
        const response = await loginService.login(logindData);
        if(response?.token && response?.refreshToken) {
            handleAuthSuccess(response);
            return response;
        }
        clearAuthState();
        return null;
    }, [loginService, handleAuthSuccess, clearAuthState]);

    const refreshAccessToken = useCallback(async () => {
        if(isRefreshing) {
            return null;
        }

        setIsRefreshing(true);
        try {
            const response = await loginService.refresh();
            if(response?.token && response?.refreshToken) {
                handleAuthSuccess(response);
                return response;
            }
            clearAuthState();
            return null;
        } finally {
            setIsRefreshing(false);
        }
    }, [clearAuthState, handleAuthSuccess, isRefreshing, loginService]);

    const logout = useCallback(() => {
        clearAuthState();
    }, [clearAuthState]);

    const value = useMemo(() => ({
        userId,
        decoded,
        login,
        logout,
        isAuthenticated,
        refreshAccessToken,
    }), [userId, decoded, login, logout, isAuthenticated, refreshAccessToken]);

    return (
        <AuthContext.Provider value={value}>
    { children }
    </AuthContext.Provider>
)
}

export default AuthProvider;
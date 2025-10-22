import axios from 'axios';
import Cookies from 'js-cookie';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { AuthResponse } from "@/dto/auth/auth.dto.ts";

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

const configuredClients = new WeakSet<AxiosInstance>();
const appConfig = {
    apiUrl: process.env.GATEWAY_URL || 'http://localhost:3001/api',
}

const refreshClient = axios.create({
    baseURL: appConfig.apiUrl,
    maxBodyLength: 5 * 1024 * 1024,
    maxContentLength: 5 * 1024 * 1024,
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refreshToken = Cookies.get('refreshToken');
            if (!refreshToken) {
                return null;
            }

            try {
                const response = await refreshClient.post<AuthResponse>('/auth/refresh', { refreshToken });
                const data = response.data;
                if (data?.token && data?.refreshToken) {
                    Cookies.set('token', data.token);
                    Cookies.set('refreshToken', data.refreshToken);
                    return data.token;
                }
            } catch (error) {
                return null;
            }

            return null;
        })()
        .finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

const handleUnauthorized = () => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    Cookies.remove('schema');
    window.location.href = '/login';
};

const applyCoreInterceptors = (client: AxiosInstance): AxiosInstance => {
    if (configuredClients.has(client)) {
        return client;
    }

    client.interceptors.request.use(
        (requestConfig) => {
            const token = Cookies.get('token');
            if (token) {
                requestConfig.headers = requestConfig.headers ?? {};
                requestConfig.headers.Authorization = `Bearer ${token}`;
            }


            return requestConfig;
        },
        (error) => Promise.reject(error),
    );

    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const status = error.response?.status;
            const originalRequest = error.config as RetryableRequestConfig | undefined;

            if (status === 401 && originalRequest && !originalRequest._retry) {
                originalRequest._retry = true;
                const newToken = await refreshAccessToken();
                if (newToken) {
                    originalRequest.headers = originalRequest.headers ?? {};
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return client(originalRequest);
                }
                handleUnauthorized();
            }

            if (status === 403) {
                handleUnauthorized();
            }

            return Promise.reject(error);
        },
    );

    configuredClients.add(client);
    return client;
};

export const createApiClient = (options: AxiosRequestConfig = {}): AxiosInstance => {
    const instance = axios.create({
        baseURL: appConfig.apiUrl,
        maxBodyLength: 5 * 1024 * 1024,
        maxContentLength: 5 * 1024 * 1024,
        ...options,
    });

    return applyCoreInterceptors(instance);
};

export const apiClient = createApiClient();

export default apiClient;

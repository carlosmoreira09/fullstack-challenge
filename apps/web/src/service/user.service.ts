import apiClient from "@/interceptor/interceptor.ts";
import type {User} from "@/dto/users/users.dto.ts";


export const userService = () => {

    const register = async (createUser: any) => {
        const response = await apiClient.post('api/user', createUser)
        return response.data
    }

    const getUserProfile = async (userId: number) => {
        const response = await apiClient.get<User>(`api/user/${userId}`)
        return response.data
    }

    const updateProfile = async (userId: number, updateUser: any) => {
        const response = await apiClient.put<User>(`api/user/${userId}`, updateUser)
        return response.data
    }

    const deleteProfile = async (userId: number) => {
        const response = await apiClient.delete(`api/user/${userId}`)
        return response.data
    }

    const listUsers = async () => {
        const response = await apiClient.get<User[]>('api/user')
        return response.data
    }

    return {
        register,
        getUserProfile,
        updateProfile,
        deleteProfile,
        listUsers
    }
}
import React, { useState} from "react";
import {AuthContext} from "@/context/context.ts";

export type Props = {
    children?: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<any>(null);
    const login = () => {

    }

    const logout = () => {
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            logout,

    }}>
    { children }
    </AuthContext.Provider>
)
}

export default AuthProvider;
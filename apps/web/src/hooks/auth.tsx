import {useContext} from "react";
import {AuthContext} from "@/context/context.ts";

export const useAuth = () => {
    return useContext(AuthContext);
};
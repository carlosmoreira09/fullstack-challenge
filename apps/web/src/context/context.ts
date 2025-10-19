import type {IAuthContext} from "@/dto/auth/auth.dto.ts";
import {createContext} from "react";

export const AuthContext = createContext<IAuthContext>({} as IAuthContext);

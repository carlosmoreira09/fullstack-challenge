import { createContext } from 'react'
import type {IAuthContext} from "@/dto/auth/auth.dto.ts";

export const AuthContext = createContext<IAuthContext | undefined>(undefined)

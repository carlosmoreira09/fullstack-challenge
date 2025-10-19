import type {IAuthContext} from "@/types/contexts.types.ts";
import {createContext} from "react";

export const AuthContext = createContext<IAuthContext>({} as IAuthContext);

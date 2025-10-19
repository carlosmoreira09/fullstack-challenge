export interface IAuthContext {
    user: any;
    setUser: (user: any) => void;
    login: (user: any) => void;
    logout: () => void;
}
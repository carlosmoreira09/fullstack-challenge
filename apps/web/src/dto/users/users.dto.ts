export interface User {
    id?: number;
    name: string;
    email: string;
    document: string;
    role: string;
    birthday: Date;
    createdById: number
}

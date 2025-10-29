export type User = {
    id: number;
    name: string;
    email: string;
    role: "Product-Manager" | "Developer";
};


export type CreateUserInput = {
    name: string;
    email: string;
    role?: "Product-Manager" | "Developer";
};
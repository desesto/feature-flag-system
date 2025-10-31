import type { CreateUserInput } from '@/types/user';

export function validateUserInput(input: CreateUserInput): string | null {
    if (!input.name || input.name.trim().length < 2) {
        return 'Brugernavn skal være mindst 2 tegn';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.email || !emailRegex.test(input.email)) {
        return 'Email skal være gyldig og indeholde @';
    }

    if (input.role && !['Developer', 'Product-Manager'].includes(input.role)) {
        return 'Ugyldig rolle';
    }

    return null;
}




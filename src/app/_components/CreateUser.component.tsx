import type { CreateUserInput, User } from '@/app/types/user';

export function validateUserInput(input: CreateUserInput): string | null {
    if (input.name.trim().length < 2) {
        return 'Brugernavn skal være mindst 2 tegn';
    }
    if (!input.email.includes('@')) {
        return 'Email skal indeholde @';
    }
    return null;
}

export async function createUser(input: CreateUserInput): Promise<User> {

    const validationError = validateUserInput(input);
    if (validationError) {
        throw new Error(validationError);
    }

    const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    });

    if (!response.ok) {
        throw new Error('Kunne ikke oprette bruger');
    }

    return response.json();
}
import type {User} from "@/app/types/user";

export async function getUser(id: string): Promise<User> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/users/${id}`, {
        cache: 'no-store' // Prevent caching if data changes frequently
    });

    if (!response.ok) {
        throw new Error('Kunne ikke hente bruger');
    }

    return response.json();
}
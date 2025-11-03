import type { CreateFeatureFlagInput } from '@/types/featureFlag';

export function validateFeatureFlagInput(input: CreateFeatureFlagInput): string | null {
    if (!input.name || input.name.trim().length < 2) {
        return 'Feature flaggets navn skal være mindst 2 tegn';
    }

    if (!input.description || input.description.trim().length < 5) {
        return 'Feature flaggets beskrivelse skal være mindst 5 tegn';
    }

    return null;
}




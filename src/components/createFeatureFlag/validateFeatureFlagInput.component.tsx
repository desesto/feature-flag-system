import type {CreateFeatureFlagDto, EditFeatureFlagDto} from "@/lib/dto/featureFlag.dto";

export function validateFeatureFlagInput(input: CreateFeatureFlagDto | EditFeatureFlagDto): string | null {
    if (!input.name || input.name.trim().length < 2) {
        return 'Feature flaggets navn skal være mindst 2 tegn';
    }

    if (!input.description || input.description.trim().length < 5) {
        return 'Feature flaggets beskrivelse skal være mindst 5 tegn';
    }

    if (input.start_time && input.end_time) {
        const startTime = input.start_time instanceof Date
            ? input.start_time.getTime()
            : new Date(input.start_time).getTime();

        const endTime = input.end_time instanceof Date
            ? input.end_time.getTime()
            : new Date(input.end_time).getTime();

        if (isNaN(startTime) || isNaN(endTime)) {
            return 'Ugyldigt datoformat';
        }

        if (startTime >= endTime) {
            return 'Sluttidspunkt skal være efter starttidspunkt og begge skal angives';
        }
    }
    return null;
}




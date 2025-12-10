import type {CreateFeatureFlagDto, EditFeatureFlagDto} from "@/lib/dto/featureFlag.dto";

export type FeatureFlagValidationError = {
    field: "name" | "description" | "dates";
    message: string;
};

export function validateFeatureFlagInput(input: CreateFeatureFlagDto | EditFeatureFlagDto): FeatureFlagValidationError | null {
    if (!input.name || input.name.trim().length < 2) {
        return { field: "name", message: "Feature flaggets navn skal være mindst 2 tegn" };
    }

    if (!input.description || input.description.trim().length < 5) {
        return { field: "description", message: "Feature flaggets beskrivelse skal være mindst 5 tegn" };
    }

    if (input.start_time && input.end_time) {
        const startTime = input.start_time instanceof Date ? input.start_time.getTime() : new Date(input.start_time).getTime();
        const endTime = input.end_time instanceof Date ? input.end_time.getTime() : new Date(input.end_time).getTime();

        if (isNaN(startTime) || isNaN(endTime)) {
            return { field: "dates", message: "Ugyldigt datoformat" };
        }

        if (startTime >= endTime) {
            return { field: "dates", message: "Sluttidspunkt skal være efter starttidspunkt og begge skal angives" };
        }
    }

    return null;
}




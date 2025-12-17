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

    if (input.startTime && input.endTime) {
        const startTime = input.startTime instanceof Date ? input.startTime.getTime() : new Date(input.startTime).getTime();
        const endTime = input.endTime instanceof Date ? input.endTime.getTime() : new Date(input.endTime).getTime();

        if (isNaN(startTime) || isNaN(endTime)) {
            return { field: "dates", message: "Ugyldigt datoformat" };
        }

        if (startTime >= endTime) {
            return { field: "dates", message: "Sluttidspunkt skal være efter starttidspunkt og begge skal angives" };
        }
    }

    return null;
}




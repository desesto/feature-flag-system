import {describe, expect, it} from "vitest";
import {validateFeatureFlagInput} from "@/components/createFeatureFlag/validateFeatureFlagInput.component";
import type {CreateFeatureFlagDto} from "@/lib/dto/featureFlag.dto";


describe("validateFeatureFlagInput", () => {
    it("returns error if name is less than 2 characters", () => {
        const input: CreateFeatureFlagDto = {
            userId: 1,
            name: "A",
            isActive: true,
            description: "En god beskrivelse",
            strategy: "NO_STRATEGY",
            whiteListId: null,
            startTime: new Date("2025-11-01"),
            endTime: new Date("2025-11-10"),
        };
        const actualOutput = validateFeatureFlagInput(input)

        expect(actualOutput).toEqual({
            field: "name",
            message: "Feature flaggets navn skal være mindst 2 tegn"
        });
    });

    it("returns error if description is less than 5 characters", () => {
            const input: CreateFeatureFlagDto = {
                userId: 1,
                name: "A very good name",
                isActive: true,
                description: "En",
                strategy: "NO_STRATEGY",
                whiteListId: null,
                startTime: new Date("2025-11-01"),
                endTime: new Date("2025-11-10"),
            };
        const actualOutput = validateFeatureFlagInput(input)

        expect(actualOutput).toEqual({
            field: "description",
            message: "Feature flaggets beskrivelse skal være mindst 5 tegn"
        });
    });

        it("returns error if start time is after end time", () => {
            const input: CreateFeatureFlagDto = {
                userId: 1,
                name: "A very good name",
                isActive: true,
                description: "A very good description",
                strategy: "NO_STRATEGY",
                whiteListId: null,
                startTime: new Date("2025-12-01"),
                endTime: new Date("2025-11-10"),
            };

        const actualOutput = validateFeatureFlagInput(input)

            expect(actualOutput).toEqual({
                field: "dates",
                message: "Sluttidspunkt skal være efter starttidspunkt og begge skal angives"
            });
        });

        it("returns null when input is valid", () => {
                const input: CreateFeatureFlagDto = {
                    userId: 1,
                    name: "Valid name",
                    isActive: true,
                    description: "Valid description",
                    strategy: "NO_STRATEGY",
                    whiteListId: null,
                    startTime: new Date("2025-11-01"),
                    endTime: new Date("2025-11-10"),
                };
                const actualOutput = validateFeatureFlagInput(input);

                expect(actualOutput).toBeNull();
            });

});
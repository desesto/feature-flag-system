import {describe, expect, it} from "vitest";
import {validateFeatureFlagInput} from "@/components/createFeatureFlag/validateFeatureFlagInput.component";
import type {CreateFeatureFlagDto} from "@/lib/dto/featureFlag.dto";


describe("validateFeatureFlagInput", () => {
    it("returns error if name is less than 2 characters", () => {
        const input: CreateFeatureFlagDto = {
            user_id: 1,
            name: "A",
            is_active: true,
            description: "En god beskrivelse",
            strategy: "NO_STRATEGY",
            white_list_id: null,
            start_time: new Date("2025-11-01"),
            end_time: new Date("2025-11-10"),
        };
        const actualOutput = validateFeatureFlagInput(input)

        expect(actualOutput).toEqual({
            field: "name",
            message: "Feature flaggets navn skal være mindst 2 tegn"
        });
    });

    it("returns error if description is less than 5 characters", () => {
            const input: CreateFeatureFlagDto = {
                user_id: 1,
                name: "A very good name",
                is_active: true,
                description: "En",
                strategy: "NO_STRATEGY",
                white_list_id: null,
                start_time: new Date("2025-11-01"),
                end_time: new Date("2025-11-10"),
            };
        const actualOutput = validateFeatureFlagInput(input)

        expect(actualOutput).toEqual({
            field: "description",
            message: "Feature flaggets beskrivelse skal være mindst 5 tegn"
        });
    });

        it("returns error if start time is after end time", () => {
            const input: CreateFeatureFlagDto = {
                user_id: 1,
                name: "A very good name",
                is_active: true,
                description: "A very good description",
                strategy: "NO_STRATEGY",
                white_list_id: null,
                start_time: new Date("2025-12-01"),
                end_time: new Date("2025-11-10"),
            };

        const actualOutput = validateFeatureFlagInput(input)

            expect(actualOutput).toEqual({
                field: "dates",
                message: "Sluttidspunkt skal være efter starttidspunkt og begge skal angives"
            });
        });

        it("returns null when input is valid", () => {
                const input: CreateFeatureFlagDto = {
                    user_id: 1,
                    name: "Valid name",
                    is_active: true,
                    description: "Valid description",
                    strategy: "NO_STRATEGY",
                    white_list_id: null,
                    start_time: new Date("2025-11-01"),
                    end_time: new Date("2025-11-10"),
                };
                const actualOutput = validateFeatureFlagInput(input);

                expect(actualOutput).toBeNull();
            });

});
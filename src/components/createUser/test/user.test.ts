import { describe, expect, it } from "vitest"
import {validateUserInput} from "@/components/createUser/validateUserInput.component";
import {CreateUserDto} from "@/lib/dto/user.dto";

describe("validateUserInput", () => {
    it("returns error if name is less than 2 characters", () => {
        const input = {
            name: "a",
            email: "test@example.com",
        } satisfies CreateUserDto

        const actualOutput = validateUserInput(input)

        expect(actualOutput).toBe("Brugernavn skal være mindst 2 tegn")
    })

    it("returns error if name is only whitespace", () => {
        const input = {
            name: "  ",
            email: "test@example.com",
        } satisfies CreateUserDto

        const actualOutput = validateUserInput(input)

        expect(actualOutput).toBe("Brugernavn skal være mindst 2 tegn")
    })

    it("returns error if email does not contain @", () => {
        const input = {
            name: "Test User",
            email: "invalidemail.com",
        } satisfies CreateUserDto

        const actualOutput = validateUserInput(input)

        expect(actualOutput).toBe("Email skal være gyldig og indeholde @")
    })

    it("returns null for valid input", () => {
        const input = {
            name: "Test User",
            email: "test@example.com",
        } satisfies CreateUserDto

        const actualOutput = validateUserInput(input)

        expect(actualOutput).toBeNull()
    })

    it("returns null for valid input with role", () => {
        const input = {
            name: "Test User",
            email: "test@example.com",
            role: "Developer",
        } satisfies CreateUserDto

        const actualOutput = validateUserInput(input)

        expect(actualOutput).toBeNull()
    })

    it("accepts name with exactly 2 characters", () => {
        const input = {
            name: "Ab",
            email: "test@example.com",
        } satisfies CreateUserDto

        const actualOutput = validateUserInput(input)

        expect(actualOutput).toBeNull()
    })

    it("trims whitespace when checking name length", () => {
        const input = {
            name: " a ",
            email: "test@example.com",
        } satisfies CreateUserDto

        const actualOutput = validateUserInput(input)

        expect(actualOutput).toBe("Brugernavn skal være mindst 2 tegn")
    })
})
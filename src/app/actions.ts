"use server";

import { augmentNameSuggestionsWithMeaning } from "@/ai/flows/augment-name-suggestions-with-meaning";
import { generateIslamicNameFromFace } from "@/ai/flows/generate-islamic-name-from-face";
import { z } from "zod";

const genderSchema = z.enum(["male", "female"]);
const dataUriSchema = z.string().startsWith("data:image/jpeg;base64,");

export type NameSuggestion = {
    name: string;
    meaning: string;
    origin: string;
};

export async function getAiSuggestions(
    photoDataUri: string,
    gender: 'male' | 'female'
): Promise<NameSuggestion[]> {
    try {
        // Validate inputs
        const validatedGender = genderSchema.parse(gender);
        const validatedPhoto = dataUriSchema.parse(photoDataUri);

        // 1. Generate name suggestions from the face
        const nameSuggestions = await generateIslamicNameFromFace({
            photoDataUri: validatedPhoto,
            gender: validatedGender,
        });

        if (!nameSuggestions.names || nameSuggestions.names.length === 0) {
            console.log("AI did not return any name suggestions.");
            return [];
        }

        // 2. Augment names with meaning and origin
        const augmentedNames = await augmentNameSuggestionsWithMeaning(nameSuggestions.names);
        
        return augmentedNames;

    } catch (error) {
        console.error("Error in getAiSuggestions server action:", error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
        }
        // Re-throw other errors to be caught by the client
        throw new Error("An unexpected error occurred while generating names.");
    }
}

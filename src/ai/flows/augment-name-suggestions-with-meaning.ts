'use server';
/**
 * @fileOverview This file defines a Genkit flow that augments name suggestions with their meaning and origin.
 *
 * - augmentNameSuggestionsWithMeaning - A function that takes a list of name suggestions and returns the list with added meanings and origins.
 * - AugmentNameSuggestionsWithMeaningInput - The input type for the augmentNameSuggestionsWithMeaning function, a list of names.
 * - AugmentNameSuggestionsWithMeaningOutput - The output type for the augmentNameSuggestionsWithMeaning function, a list of names with meanings and origins.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AugmentNameSuggestionsWithMeaningInputSchema = z.array(z.string()).describe('An array of suggested names.');
export type AugmentNameSuggestionsWithMeaningInput = z.infer<typeof AugmentNameSuggestionsWithMeaningInputSchema>;

const AugmentNameSuggestionsWithMeaningOutputSchema = z.array(
  z.object({
    name: z.string().describe('The suggested name.'),
    meaning: z.string().describe('The meaning of the name.'),
    origin: z.string().describe('The origin of the name.'),
  })
);
export type AugmentNameSuggestionsWithMeaningOutput = z.infer<typeof AugmentNameSuggestionsWithMeaningOutputSchema>;

export async function augmentNameSuggestionsWithMeaning(
  input: AugmentNameSuggestionsWithMeaningInput
): Promise<AugmentNameSuggestionsWithMeaningOutput> {
  return augmentNameSuggestionsWithMeaningFlow(input);
}

const augmentNameSuggestionsWithMeaningPrompt = ai.definePrompt({
  name: 'augmentNameSuggestionsWithMeaningPrompt',
  input: {schema: AugmentNameSuggestionsWithMeaningInputSchema},
  output: {schema: AugmentNameSuggestionsWithMeaningOutputSchema},
  prompt: `For each name in the following list, provide its meaning and origin. Return a JSON array where each object contains the name, meaning, and origin.

Names: {{{JSON.stringify input}}}`,
});

const augmentNameSuggestionsWithMeaningFlow = ai.defineFlow(
  {
    name: 'augmentNameSuggestionsWithMeaningFlow',
    inputSchema: AugmentNameSuggestionsWithMeaningInputSchema,
    outputSchema: AugmentNameSuggestionsWithMeaningOutputSchema,
  },
  async input => {
    const {output} = await augmentNameSuggestionsWithMeaningPrompt(input);
    return output!;
  }
);

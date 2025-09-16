'use server';

/**
 * @fileOverview AI-powered Islamic name generator based on facial analysis.
 *
 * - generateIslamicNameFromFace - A function that suggests Islamic names based on facial features.
 * - GenerateIslamicNameFromFaceInput - The input type for the generateIslamicNameFromFace function.
 * - GenerateIslamicNameFromFaceOutput - The return type for the generateIslamicNameFromFace function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenderEnum = z.enum(['male', 'female']);

const GenerateIslamicNameFromFaceInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the baby's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  gender: GenderEnum.describe('The gender of the baby.'),
});
export type GenerateIslamicNameFromFaceInput = z.infer<
  typeof GenerateIslamicNameFromFaceInputSchema
>;

const GenerateIslamicNameFromFaceOutputSchema = z.object({
  names: z
    .array(z.string())
    .describe('A list of suggested Islamic names based on facial features.'),
});
export type GenerateIslamicNameFromFaceOutput = z.infer<
  typeof GenerateIslamicNameFromFaceOutputSchema
>;

export async function generateIslamicNameFromFace(
  input: GenerateIslamicNameFromFaceInput
): Promise<GenerateIslamicNameFromFaceOutput> {
  return generateIslamicNameFromFaceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIslamicNameFromFacePrompt',
  input: {schema: GenerateIslamicNameFromFaceInputSchema},
  output: {schema: GenerateIslamicNameFromFaceOutputSchema},
  prompt: `You are an expert in suggesting Islamic names for newborns based on their facial features.

  Given the photo of the baby and their gender, suggest a list of appropriate Islamic names.
  Consider the cultural appropriateness and the meanings of the names.

  Gender: {{{gender}}}
  Photo: {{media url=photoDataUri}}

  Return a list of names that would be suitable for the baby.
  Return only the array of names.
  `,
});

const generateIslamicNameFromFaceFlow = ai.defineFlow(
  {
    name: 'generateIslamicNameFromFaceFlow',
    inputSchema: GenerateIslamicNameFromFaceInputSchema,
    outputSchema: GenerateIslamicNameFromFaceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

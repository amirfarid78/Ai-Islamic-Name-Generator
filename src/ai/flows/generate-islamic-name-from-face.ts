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

export type GenerateIslamicNameFromFaceInput = z.infer<
  typeof GenerateIslamicNameFromFaceInputSchema
>;
const GenerateIslamicNameFromFaceInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the baby's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  gender: GenderEnum.describe('The gender of the baby.'),
});


export type GenerateIslamicNameFromFaceOutput = z.infer<
  typeof GenerateIslamicNameFromFaceOutputSchema
>;
const GenerateIslamicNameFromFaceOutputSchema = z.object({
  names: z
    .array(z.string())
    .describe('A list of suggested Islamic names based on facial features.'),
});

export async function generateIslamicNameFromFace(
  input: GenerateIslamicNameFromFaceInput
): Promise<GenerateIslamicNameFromFaceOutput> {
  return generateIslamicNameFromFaceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIslamicNameFromFacePrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: GenerateIslamicNameFromFaceInputSchema},
  output: {schema: GenerateIslamicNameFromFaceOutputSchema},
  prompt: `You are an expert in Islamic names. Based on the photo of the baby provided, suggest a list of 5 Islamic names that feel suitable for them.

Gender: {{{gender}}}
Photo: {{media url=photoDataUri}}

Return a JSON object with a 'names' array containing your suggestions.`,
});

const generateIslamicNameFromFaceFlow = ai.defineFlow(
  {
    name: 'generateIslamicNameFromFaceFlow',
    inputSchema: GenerateIslamicNameFromFaceInputSchema,
    outputSchema: GenerateIslamicNameFromFaceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Safety check: Ensure the output and names array exist.
    if (!output || !Array.isArray(output.names)) {
      console.warn('AI did not return a valid name list for facial analysis.');
      return { names: [] };
    }

    return output;
  }
);

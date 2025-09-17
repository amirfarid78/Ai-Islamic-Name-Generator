'use server';

/**
 * @fileOverview AI agent for suggesting Islamic names via chat.
 *
 * - chatWithAgent - A function that suggests names based on father's name and gender.
 * - ChatWithAgentInput - The input type for the chatWithAgent function.
 * - ChatWithAgentOutput - The return type for the chatWithAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenderEnum = z.enum(['male', 'female']);

const ChatWithAgentInputSchema = z.object({
  fatherName: z.string().describe("The father's name."),
  gender: GenderEnum.describe('The gender of the baby.'),
  existingNames: z
    .array(z.string())
    .optional()
    .describe('A list of names already suggested to avoid repetition.'),
});
export type ChatWithAgentInput = z.infer<typeof ChatWithAgentInputSchema>;

const ChatWithAgentOutputSchema = z.object({
  names: z
    .array(z.string())
    .describe('A list of 1-3 new suggested Islamic names.'),
});
export type ChatWithAgentOutput = z.infer<typeof ChatWithAgentOutputSchema>;

export async function chatWithAgent(
  input: ChatWithAgentInput
): Promise<ChatWithAgentOutput> {
  return chatWithAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithAgentPrompt',
  input: {schema: ChatWithAgentInputSchema},
  output: {schema: ChatWithAgentOutputSchema},
  prompt: `You are an AI specializing in Islamic names. A user wants name suggestions for their baby.

The user has provided:
- Father's Name: {{{fatherName}}}
- Baby's Gender: {{{gender}}}

Suggest 1 to 3 beautiful Islamic names for the baby. The names should be related to the father's name (similar meaning, variations, etc.).
{{#if existingNames}}
Do not suggest the following names: {{{JSON.stringify existingNames}}}.
{{/if}}

Return a JSON object with a 'names' array. If you have no new suggestions, return an empty array.`,
});

const chatWithAgentFlow = ai.defineFlow(
  {
    name: 'chatWithAgentFlow',
    inputSchema: ChatWithAgentInputSchema,
    outputSchema: ChatWithAgentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    // Safety check: Ensure the output and names array exist.
    if (!output || !Array.isArray(output.names)) {
      console.warn('AI did not return a valid name list for chat agent.');
      return { names: [] };
    }

    return output;
  }
);

'use server';
/**
 * @fileOverview An AI flow for changing the tone of a given text.
 *
 * - changeTone - A function that rewrites text in a specified tone.
 * - ChangeToneInput - The input type for the changeTone function.
 * - ChangeToneOutput - The return type for the changeTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ChangeToneInputSchema = z.object({
  text: z.string().describe('The original text to be transformed.'),
  tone: z.string().describe('The target tone to apply to the text. e.g., "formal", "humorous", "Gen Z".'),
});
export type ChangeToneInput = z.infer<typeof ChangeToneInputSchema>;

const ChangeToneOutputSchema = z.object({
  changedText: z.string().describe('The rewritten text in the specified tone.'),
});
export type ChangeToneOutput = z.infer<typeof ChangeToneOutputSchema>;

const prompt = ai.definePrompt({
  name: 'toneChangerPrompt',
  input: { schema: ChangeToneInputSchema },
  output: { schema: ChangeToneOutputSchema },
  prompt: `You are an expert editor and writer. Your task is to rewrite the following text into a specific tone, as requested by the user.

Original Text:
"{{text}}"

Rewrite the above text to have a "{{tone}}" tone.

Only return the rewritten text in the 'changedText' field. Do not add any preamble or explanation.`,
});

const changeToneFlow = ai.defineFlow(
  {
    name: 'changeToneFlow',
    inputSchema: ChangeToneInputSchema,
    outputSchema: ChangeToneOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function changeTone(input: ChangeToneInput): Promise<ChangeToneOutput> {
  return changeToneFlow(input);
}

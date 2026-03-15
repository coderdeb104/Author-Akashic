'use server';
/**
 * @fileOverview A character detail generation AI flow.
 *
 * - generateCharacterDetail - A function that generates a description or trivia for a character.
 * - GenerateCharacterDetailInput - The input type for the generateCharacterDetail function.
 * - GenerateCharacterDetailOutput - The return type for the generateCharacterDetail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterDetailInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  race: z.string().describe('The race of the character.').optional().nullable(),
  role: z.string().describe('The role of the character in the story.').optional().nullable(),
  intro: z.string().describe("A short, punchy introduction to the character.").optional().nullable(),
  detailType: z.enum(['description', 'trivia']).describe('The type of detail to generate.'),
});
export type GenerateCharacterDetailInput = z.infer<typeof GenerateCharacterDetailInputSchema>;

const GenerateCharacterDetailOutputSchema = z.object({
  generatedText: z.string().describe('The generated text for the specified detail type.'),
});
export type GenerateCharacterDetailOutput = z.infer<typeof GenerateCharacterDetailOutputSchema>;


export async function generateCharacterDetail(input: GenerateCharacterDetailInput): Promise<GenerateCharacterDetailOutput> {
  const { output } = await characterDetailFlow(input);
  return output!;
}


const prompt = ai.definePrompt({
  name: 'characterDetailPrompt',
  input: { schema: GenerateCharacterDetailInputSchema },
  output: { schema: GenerateCharacterDetailOutputSchema },
  prompt: `You are a creative writer's assistant, an expert in fantasy world-building and character development.

Given the following core details about a character, please generate a compelling {{detailType}} for them.

Character Details:
- Name: {{name}}
{{#if race}}- Race: {{race}}{{/if}}
{{#if role}}- Role: {{role}}{{/if}}
{{#if intro}}- One-line Intro: "{{intro}}"{{/if}}

Your task is to generate the "{{detailType}}".

- If generating a 'description', write a rich paragraph (about 100-150 words) covering their personality, backstory, and motivations. Be creative and evocative.
- If generating 'trivia', provide a bulleted list of 3-5 interesting and lesser-known facts, secrets, or quirks about the character.

Return the result in the 'generatedText' field.`,
});


const characterDetailFlow = ai.defineFlow(
  {
    name: 'characterDetailFlow',
    inputSchema: GenerateCharacterDetailInputSchema,
    outputSchema: GenerateCharacterDetailOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

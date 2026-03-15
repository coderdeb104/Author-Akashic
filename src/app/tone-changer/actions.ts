'use server'

import { changeTone, type ChangeToneInput } from '@/ai/flows/change-tone-flow';

export async function changeToneAction(input: ChangeToneInput) {
  try {
      const result = await changeTone(input);
      return { success: true, text: result.changedText };
  } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || 'Failed to change tone.' };
  }
}

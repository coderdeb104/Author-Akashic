
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  text: z.string().min(1, 'Quote text is required.'),
  speaker: z.string().optional().nullable(),
});

export async function saveQuote(quoteId: string | null, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save a quote.' }
  }

  const values = Object.fromEntries(formData.entries());
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    return { error: 'Invalid data provided.', errors: parsed.error.flatten().fieldErrors };
  }
  
  const dataToSave = {
    ...parsed.data,
    user_id: user.id,
  }

  let result;
  if (quoteId) {
    result = await supabase.from('quotes').update(dataToSave).eq('id', quoteId);
  } else {
    result = await supabase.from('quotes').insert(dataToSave);
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath('/quotes')
  redirect('/quotes')
}

export async function deleteQuote(quoteId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('quotes').delete().eq('id', quoteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/quotes');
  redirect('/quotes');
}

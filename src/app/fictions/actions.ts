
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional().nullable(),
});

export async function saveFiction(fictionId: string | null, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save a fiction.' }
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
  if (fictionId) {
    result = await supabase.from('fictions').update(dataToSave).eq('id', fictionId);
  } else {
    result = await supabase.from('fictions').insert(dataToSave);
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath('/fictions')
  redirect('/fictions')
}

export async function deleteFiction(fictionId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('fictions').delete().eq('id', fictionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/fictions');
  redirect('/fictions');
}

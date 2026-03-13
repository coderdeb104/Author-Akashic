
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  summary: z.string().min(1, 'Summary is required.'),
  details: z.string().optional().nullable(),
  topic_id: z.string().uuid('A valid topic must be selected.'),
});

export async function saveFact(factId: string | null, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save a fact.' }
  }

  const values = Object.fromEntries(formData.entries());
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    console.log(parsed.error.flatten())
    return { error: 'Invalid data provided.', errors: parsed.error.flatten().fieldErrors };
  }
  
  const dataToSave = {
    ...parsed.data,
    user_id: user.id,
  }

  let result;
  if (factId) {
    result = await supabase.from('world_facts').update(dataToSave).eq('id', factId);
  } else {
    result = await supabase.from('world_facts').insert(dataToSave);
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath('/facts')
  redirect('/facts')
}

export async function deleteFact(factId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('world_facts').delete().eq('id', factId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/facts');
  redirect('/facts');
}

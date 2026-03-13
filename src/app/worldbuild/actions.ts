
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  topic: z.string().min(1, 'Topic is required.'),
  fact: z.string().optional().nullable(),
});

export async function saveWorldbuild(entryId: string | null, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save an entry.' }
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
  if (entryId) {
    result = await supabase.from('worldbuild').update(dataToSave).eq('id', entryId);
  } else {
    result = await supabase.from('worldbuild').insert(dataToSave);
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath('/worldbuild')
  redirect('/worldbuild')
}

export async function deleteWorldbuild(entryId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('worldbuild').delete().eq('id', entryId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/worldbuild');
  redirect('/worldbuild');
}

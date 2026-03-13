
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional().nullable(),
  family_head: z.string().optional().nullable(),
  members: z.string().optional().nullable(),
});

export async function saveFamilyName(familyNameId: string | null, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save a family name.' }
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
  if (familyNameId) {
    result = await supabase.from('family_names').update(dataToSave).eq('id', familyNameId);
  } else {
    result = await supabase.from('family_names').insert(dataToSave);
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath('/family-names')
  redirect('/family-names')
}

export async function deleteFamilyName(familyNameId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('family_names').delete().eq('id', familyNameId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/family-names');
  redirect('/family-names');
}

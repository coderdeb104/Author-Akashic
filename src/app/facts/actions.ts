
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

const envCheck = () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { error: 'Supabase environment variables (URL and anon key) are not set. Please check your Vercel project settings.' };
    }
    return null;
}

const getDbErrorMessage = (message: string): string => {
    const supUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const urlHint = supUrl ? ` (Project URL starts with: ${supUrl.substring(0, 20)}...)` : ' (Project URL not found in environment variables!)';
    return `${message}.${urlHint}`;
}

export async function saveFact(factId: string | null, formData: FormData) {
  const envError = envCheck();
  if (envError) return envError;

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
    return { error: getDbErrorMessage(result.error.message) }
  }

  revalidatePath('/facts')
  redirect('/facts')
}

export async function deleteFact(factId: string) {
  const envError = envCheck();
  if (envError) return envError;

  const supabase = createClient();
  const { error } = await supabase.from('world_facts').delete().eq('id', factId);

  if (error) {
    return { error: getDbErrorMessage(error.message) };
  }

  revalidatePath('/facts');
  redirect('/facts');
}

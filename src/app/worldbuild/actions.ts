
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  topic: z.string().min(1, 'Topic is required.'),
  fact: z.string().optional().nullable(),
  fiction_ids: z.array(z.string()).optional(),
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

export async function saveWorldbuild(entryId: string | null, formData: FormData) {
  const envError = envCheck();
  if (envError) return envError;

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save an entry.' }
  }

  const values = {
    topic: formData.get('topic'),
    fact: formData.get('fact'),
    fiction_ids: formData.getAll('fiction_ids') || [],
  };
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
    return { error: getDbErrorMessage(result.error.message) }
  }

  revalidatePath('/worldbuild')
  redirect('/worldbuild')
}

export async function deleteWorldbuild(entryId: string) {
  const envError = envCheck();
  if (envError) return envError;

  const supabase = createClient();
  const { error } = await supabase.from('worldbuild').delete().eq('id', entryId);

  if (error) {
    return { error: getDbErrorMessage(error.message) };
  }

  revalidatePath('/worldbuild');
  redirect('/worldbuild');
}

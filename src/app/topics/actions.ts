
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional().nullable(),
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

export async function saveTopic(topicId: string | null, formData: FormData) {
  const envError = envCheck();
  if (envError) return envError;

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save a topic.' }
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
  if (topicId) {
    result = await supabase.from('world_topics').update(dataToSave).eq('id', topicId);
  } else {
    result = await supabase.from('world_topics').insert(dataToSave);
  }

  if (result.error) {
    return { error: getDbErrorMessage(result.error.message) }
  }

  revalidatePath('/topics')
  redirect('/topics')
}

export async function deleteTopic(topicId: string) {
  const envError = envCheck();
  if (envError) return envError;

  const supabase = createClient();
  const { error } = await supabase.from('world_topics').delete().eq('id', topicId);

  if (error) {
    return { error: getDbErrorMessage(error.message) };
  }

  revalidatePath('/topics');
  redirect('/topics');
}

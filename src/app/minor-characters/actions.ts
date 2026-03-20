
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional().nullable(),
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

export async function saveMinorCharacter(characterId: string | null, formData: FormData) {
  const envError = envCheck();
  if (envError) return envError;

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save a minor character.' }
  }

  const values = {
    name: formData.get('name'),
    description: formData.get('description'),
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
  if (characterId) {
    result = await supabase.from('minor_characters').update(dataToSave).eq('id', characterId);
  } else {
    result = await supabase.from('minor_characters').insert(dataToSave);
  }

  if (result.error) {
    return { error: getDbErrorMessage(result.error.message) }
  }

  revalidatePath('/minor-characters')
  redirect('/minor-characters')
}

export async function deleteMinorCharacter(characterId: string) {
  const envError = envCheck();
  if (envError) return envError;
  
  const supabase = createClient();
  const { error } = await supabase.from('minor_characters').delete().eq('id', characterId);

  if (error) {
    return { error: getDbErrorMessage(error.message) };
  }

  revalidatePath('/minor-characters');
  redirect('/minor-characters');
}


'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  fiction_ids: z.array(z.string()).optional(),
});

export async function savePlace(placeId: string | null, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save a place.' }
  }

  const values = {
    name: formData.get('name'),
    description: formData.get('description'),
    area: formData.get('area'),
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
  if (placeId) {
    result = await supabase.from('places').update(dataToSave).eq('id', placeId);
  } else {
    result = await supabase.from('places').insert(dataToSave);
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath('/places')
  redirect('/places')
}

export async function deletePlace(placeId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('places').delete().eq('id', placeId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/places');
  redirect('/places');
}

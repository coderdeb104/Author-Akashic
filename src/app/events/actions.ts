
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional().nullable(),
  event_date: z.string().optional().nullable(),
  fiction_ids: z.array(z.string()).optional(),
});

export async function saveEvent(eventId: string | null, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save an event.' }
  }

  const values = {
      title: formData.get('title'),
      description: formData.get('description'),
      event_date: formData.get('event_date'),
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
  if (eventId) {
    result = await supabase.from('events').update(dataToSave).eq('id', eventId);
  } else {
    result = await supabase.from('events').insert(dataToSave);
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath('/events')
  redirect('/events')
}

export async function deleteEvent(eventId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('events').delete().eq('id', eventId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/events');
  redirect('/events');
}

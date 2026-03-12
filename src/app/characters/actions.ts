'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  intro: z.string().max(100).refine(s => s.trim() === '' || s.trim().split(/\s+/).length <= 5, {
    message: 'Introduction must be 5 words or less.',
  }),
  age: z.coerce.number().positive().optional().nullable(),
  sex: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  appearance: z.object({
    height: z.string().optional().nullable(),
    hair: z.string().optional().nullable(),
    eyes: z.string().optional().nullable(),
    distinguishing_features: z.string().optional().nullable(),
  }),
  description: z.string().optional().nullable(),
  trivia: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
});

export async function saveCharacter(characterId: string | null, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save a character.' }
  }

  const values = {
    name: formData.get('name'),
    intro: formData.get('intro'),
    age: formData.get('age') ? Number(formData.get('age')) : null,
    sex: formData.get('sex'),
    role: formData.get('role'),
    description: formData.get('description'),
    trivia: formData.get('trivia'),
    image_url: formData.get('image_url'),
    appearance: {
        height: formData.get('appearance.height'),
        hair: formData.get('appearance.hair'),
        eyes: formData.get('appearance.eyes'),
        distinguishing_features: formData.get('appearance.distinguishing_features'),
    },
  };

  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    console.error('Validation error:', parsed.error.flatten().fieldErrors);
    return { error: 'Invalid data provided.', errors: parsed.error.flatten().fieldErrors };
  }
  
  const dataToSave = {
    ...parsed.data,
    user_id: user.id,
  }

  let result;
  if (characterId) {
    // Update
    result = await supabase.from('characters').update(dataToSave).eq('id', characterId).select().single();
  } else {
    // Create
    result = await supabase.from('characters').insert(dataToSave).select().single();
  }

  if (result.error) {
    console.error('Supabase error:', result.error)
    return { error: result.error.message }
  }

  revalidatePath('/characters')
  if (result.data?.id) {
    revalidatePath(`/characters/${result.data.id}/edit`);
  }
  redirect('/characters')
}

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file provided.' };
  }
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const filePath = `${user.id}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('character-images')
    .upload(filePath, file);

  if (error) {
    console.error('Image upload error:', error);
    return { error: error.message };
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('character-images')
    .getPublicUrl(data.path);

  return { url: publicUrl };
}

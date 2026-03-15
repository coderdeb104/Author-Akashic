'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { generateCharacterDetail, type GenerateCharacterDetailInput } from '@/ai/flows/generate-character-details';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  intro: z.string().max(100).refine(s => s.trim().split(/\s+/).length <= 5, {
    message: 'Introduction must be 5 words or less.',
  }).optional().nullable(),
  age: z.coerce.number().positive().optional().nullable(),
  sex: z.string().optional().nullable(),
  race: z.string().optional().nullable(),
  spouse: z.string().optional().nullable(),
  vital_status: z.string().optional().nullable(),
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
    intro: formData.get('intro') || null,
    age: formData.get('age') && formData.get('age') !== '0' ? Number(formData.get('age')) : null,
    sex: formData.get('sex') || null,
    race: formData.get('race') || null,
    spouse: formData.get('spouse') || null,
    vital_status: formData.get('vital_status') || null,
    role: formData.get('role') || null,
    description: formData.get('description') || null,
    trivia: formData.get('trivia') || null,
    image_url: formData.get('image_url') || null,
    appearance: {
        height: formData.get('appearance.height') || null,
        hair: formData.get('appearance.hair') || null,
        eyes: formData.get('appearance.eyes') || null,
        distinguishing_features: formData.get('appearance.distinguishing_features') || null,
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
    return { error: 'Unauthorized. You must be logged in to upload an image.' };
  }

  const filePath = `${user.id}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('character-images')
    .upload(filePath, file);

  if (error) {
    console.error('Upload error:', error)
    return { error: `Upload failed: ${error.message}` };
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('character-images')
    .getPublicUrl(data.path);

  return { url: publicUrl };
}

export async function deleteCharacter(characterId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete a character.' };
  }

  // First, get the character to find the image URL
  const { data: character, error: fetchError } = await supabase
    .from('characters')
    .select('image_url')
    .eq('id', characterId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    return { error: 'Could not find character to delete.' };
  }

  // If there's an image, delete it from storage
  if (character.image_url) {
    const url = new URL(character.image_url);
    const imagePath = url.pathname.split('/character-images/')[1];
    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from('character-images')
        .remove([imagePath]);
      if (storageError) {
        console.error('Error deleting image from storage:', storageError.message);
        // We can choose to continue even if image deletion fails
      }
    }
  }
  
  // Then, delete the character record
  const { error: deleteError } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath('/characters');
  redirect('/characters');
}

export async function generateCharacterDetailAction(input: GenerateCharacterDetailInput) {
  try {
      const result = await generateCharacterDetail(input);
      return { success: true, text: result.generatedText };
  } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || 'Failed to generate details.' };
  }
}

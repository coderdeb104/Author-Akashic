
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  genres: z.array(z.string()).optional(),
});

export async function saveFiction(fictionId: string | null, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save a fiction.' }
  }

  const values = {
    title: formData.get('title'),
    description: formData.get('description'),
    image_url: formData.get('image_url') || null,
    genres: formData.getAll('genres') || [],
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
  if (fictionId) {
    result = await supabase.from('fictions').update(dataToSave).eq('id', fictionId).select().single();
  } else {
    result = await supabase.from('fictions').insert(dataToSave).select().single();
  }

  if (result.error) {
    return { error: result.error.message }
  }

  revalidatePath('/fictions')
  if(result.data?.id) {
    revalidatePath(`/fictions/${result.data.id}/edit`);
  }
  redirect('/fictions')
}

export async function uploadFictionImage(formData: FormData) {
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

  // Upload to a 'fiction-images' bucket
  const { data, error } = await supabase.storage
    .from('fiction-images')
    .upload(filePath, file);

  if (error) {
    console.error('Upload error:', error)
    return { error: `Upload failed: ${error.message}` };
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('fiction-images')
    .getPublicUrl(data.path);

  return { url: publicUrl };
}


export async function deleteFiction(fictionId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete a fiction.' };
  }

  // First, get the fiction to find the image URL
  const { data: fiction, error: fetchError } = await supabase
    .from('fictions')
    .select('image_url')
    .eq('id', fictionId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    return { error: 'Could not find fiction to delete.' };
  }

  // If there's an image, delete it from storage
  if (fiction.image_url) {
    const url = new URL(fiction.image_url);
    const pathSegments = url.pathname.split('/');
    const imagePath = pathSegments.slice(pathSegments.indexOf('fiction-images') + 1).join('/');

    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from('fiction-images')
        .remove([imagePath]);
      if (storageError) {
        console.error('Error deleting image from storage:', storageError.message);
        // We can choose to continue even if image deletion fails
      }
    }
  }

  // Then, delete the fiction record
  const { error: deleteError } = await supabase.from('fictions').delete().eq('id', fictionId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath('/fictions');
  redirect('/fictions');
}


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

export async function saveFiction(fictionId: string | null, formData: FormData) {
  const envError = envCheck();
  if (envError) return envError;

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
    return { error: getDbErrorMessage(result.error.message) }
  }

  revalidatePath('/fictions')
  if(result.data?.id) {
    revalidatePath(`/fictions/${result.data.id}/edit`);
  }
  redirect('/fictions')
}

export async function uploadFictionImage(formData: FormData) {
  const envError = envCheck();
  if (envError) return envError;

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
    return { error: getDbErrorMessage(`Upload failed: ${error.message}`) };
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('fiction-images')
    .getPublicUrl(data.path);

  return { url: publicUrl };
}


export async function deleteFiction(fictionId: string) {
  const envError = envCheck();
  if (envError) return envError;

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
    return { error: getDbErrorMessage('Could not find fiction to delete.') };
  }

  // If there's an image, delete it from storage
  if (fiction.image_url) {
    const url = new URL(fiction.image_url);
    const imagePath = url.pathname.split('/fiction-images/')[1];

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
    return { error: getDbErrorMessage(deleteError.message) };
  }

  revalidatePath('/fictions');
  redirect('/fictions');
}

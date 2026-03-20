'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const emailSchema = z.string().email({ message: 'Invalid email address' })
const passwordSchema = z.string().min(8, { message: 'Password must be at least 8 characters long' })

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


export async function signup(prevState: any, formData: FormData) {
  const supabase = createClient()

  const validatedFields = z.object({
    email: emailSchema,
    password: passwordSchema,
  }).safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return {
      message: error.message,
    }
  }
  
  if (data.user && !data.session) {
    return {
      message: 'Check your email for a confirmation link to complete your signup.',
      success: true,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/fictions')
}

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()
  
  const validatedFields = z.object({
    email: emailSchema,
    password: passwordSchema,
  }).safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/fictions')
}

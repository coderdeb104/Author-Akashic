'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const emailSchema = z.string().email({ message: 'Invalid email address' })
const passwordSchema = z.string().min(8, { message: 'Password must be at least 8 characters long' })

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

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/characters')
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
  redirect('/characters')
}

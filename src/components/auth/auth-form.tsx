'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login, signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Wand2 } from 'lucide-react'

type Mode = 'login' | 'signup'

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === 'login' ? login : signup
  const [state, formAction] = useFormState(action, null)
  const { toast } = useToast()

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: state.message,
      })
    }
  }, [state, toast])

  return (
    <Card className="w-full">
      <form action={formAction}>
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <Wand2 className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="font-headline text-2xl">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Enter your credentials to access your dossier.'
              : 'Join the arcane order to manage your characters.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            {state?.errors?.email && <p className="text-xs font-medium text-destructive">{state.errors.email[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && <p className="text-xs font-medium text-destructive">{state.errors.password[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton mode={mode} />
          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link href={mode === 'login' ? '/signup' : '/login'} className="font-semibold text-primary underline-offset-4 hover:underline">
              {mode === 'login' ? 'Sign up' : 'Login'}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Sign Up')}
    </Button>
  )
}

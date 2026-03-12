"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveCharacter } from '@/app/characters/actions';
import type { Character } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploader from './image-uploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    intro: z.string().max(100, "Too long.").refine(s => s.trim() === '' || s.trim().split(/\s+/).length <= 5, {
      message: 'Introduction must be 5 words or less.',
    }).optional().nullable(),
    age: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.coerce.number({invalid_type_error: "Age must be a number."}).positive("Age must be positive.").optional().nullable()
    ),
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
    image_url: z.string().url("Must be a valid URL.").or(z.literal('')).optional().nullable(),
});

type CharacterFormData = z.infer<typeof formSchema>;

export default function CharacterForm({ character }: { character?: Pick<Character, 'id' | 'name' | 'intro' | 'age' | 'sex' | 'role' | 'appearance' | 'description' | 'trivia' | 'image_url'> | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CharacterFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: character?.name ?? '',
            intro: character?.intro ?? '',
            age: character?.age ?? undefined,
            sex: character?.sex ?? '',
            role: character?.role ?? '',
            appearance: {
                height: character?.appearance?.height ?? '',
                hair: character?.appearance?.hair ?? '',
                eyes: character?.appearance?.eyes ?? '',
                distinguishing_features: character?.appearance?.distinguishing_features ?? '',
            },
            description: character?.description ?? '',
            trivia: character?.trivia ?? '',
            image_url: character?.image_url ?? '',
        },
    });

    const onSubmit = async (values: CharacterFormData) => {
        setIsSubmitting(true);
        const formData = new FormData();
        
        Object.entries(values).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              if (key === 'appearance' && typeof value === 'object' && value) {
                Object.entries(value).forEach(([subKey, subValue]) => {
                  if (subValue) formData.append(`appearance.${subKey}`, subValue);
                });
              } else if (key !== 'appearance') {
                formData.append(key, value.toString());
              }
            }
        });

        const result = await saveCharacter(character?.id ?? null, formData);

        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: result.error,
            });
            setIsSubmitting(false);
        } else {
            toast({
                title: `Character ${character ? 'updated' : 'created'}!`,
                description: `${values.name} is ready.`,
            });
            // Redirect is handled in server action, no need to setIsSubmitting(false)
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="md:col-span-1 flex justify-center md:justify-start">
                        <FormField
                            control={form.control}
                            name="image_url"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel>Character Portrait</FormLabel>
                                    <FormControl>
                                        <ImageUploader 
                                            onUpload={(url) => field.onChange(url)} 
                                            initialImageUrl={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader><CardTitle className="font-headline">Core Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Character's full name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="intro" render={({ field }) => ( <FormItem><FormLabel>5-Word Intro</FormLabel><FormControl><Input placeholder="Brave, loyal, and always hungry" {...field} value={field.value ?? ''} /></FormControl><FormDescription>A short, punchy introduction.</FormDescription><FormMessage /></FormItem> )} />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <FormField control={form.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="27" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="sex" render={({ field }) => ( <FormItem><FormLabel>Sex</FormLabel><FormControl><Input placeholder="e.g., Male, Female, Non-binary" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="role" render={({ field }) => ( <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="e.g., Protagonist, Antagonist, Sidekick" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle className="font-headline">Appearance</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField control={form.control} name="appearance.height" render={({ field }) => ( <FormItem><FormLabel>Height</FormLabel><FormControl><Input placeholder="e.g., 6'2&quot;" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="appearance.hair" render={({ field }) => ( <FormItem><FormLabel>Hair</FormLabel><FormControl><Input placeholder="e.g., Long, blonde" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="appearance.eyes" render={({ field }) => ( <FormItem><FormLabel>Eyes</FormLabel><FormControl><Input placeholder="e.g., Sharp, blue" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="appearance.distinguishing_features" render={({ field }) => ( <FormItem><FormLabel>Distinguishing Features</FormLabel><FormControl><Input placeholder="e.g., Scar over left eye" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                      </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="font-headline">Narrative</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the character's personality, backstory, and motivations..." className="min-h-32" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="trivia" render={({ field }) => ( <FormItem><FormLabel>Trivia</FormLabel><FormControl><Textarea placeholder="List interesting facts, secrets, or quirks..." className="min-h-24" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Character'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

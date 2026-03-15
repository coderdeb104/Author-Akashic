
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveFiction } from '@/app/fictions/actions';
import type { Fiction } from '@/lib/types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import FictionImageUploader from './fiction-image-uploader';
import { Checkbox } from '../ui/checkbox';

const GENRES = [
    "Fantasy", "Science Fiction", "Dystopian", "Adventure", "Romance", 
    "Mystery", "Horror", "Thriller", "Historical Fiction", "Young Adult",
    "Children's", "Memoir", "Cookbook", "Art", "Self-help", "Development",
    "Motivational", "Health", "History", "Travel", "Guide / How-to",
    "Families & Relationships", "Humor", "Political & Social Sciences"
];

const formSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().optional().nullable(),
    image_url: z.string().url().or(z.literal('')).optional().nullable(),
    genres: z.array(z.string()).optional(),
});

type FictionFormData = z.infer<typeof formSchema>;

export default function FictionForm({ fiction }: { fiction?: Fiction | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FictionFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: fiction?.title ?? '',
            description: fiction?.description ?? '',
            image_url: fiction?.image_url ?? '',
            genres: fiction?.genres ?? [],
        },
    });

    const onSubmit = async (values: FictionFormData) => {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (key === 'genres' && Array.isArray(value)) {
                value.forEach(item => formData.append('genres', item));
            } else if (value) {
                formData.append(key, value as string);
            }
        });

        const result = await saveFiction(fiction?.id ?? null, formData);

        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: result.error,
            });
            setIsSubmitting(false);
        } else {
            toast({
                title: `Fiction ${fiction ? 'updated' : 'created'}!`,
                description: `${values.title} has been saved.`,
            });
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
                                    <FormLabel>Book Cover</FormLabel>
                                    <FormControl>
                                        <FictionImageUploader 
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
                            <CardHeader><CardTitle className="font-headline">Fiction Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., The Stormlight Archive" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the work..." className="min-h-32" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Genres</CardTitle>
                        <FormDescription>Select one or more genres that fit your work.</FormDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="genres"
                            render={() => (
                                <FormItem>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {GENRES.map((genre) => (
                                            <FormField
                                                key={genre}
                                                control={form.control}
                                                name="genres"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={genre}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(genre)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value ?? []), genre])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== genre
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {genre}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Fiction'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

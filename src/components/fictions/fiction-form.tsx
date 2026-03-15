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

const formSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().optional().nullable(),
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
        },
    });

    const onSubmit = async (values: FictionFormData) => {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
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
                <Card>
                    <CardHeader><CardTitle className="font-headline">Fiction Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., The Stormlight Archive" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the work..." className="min-h-32" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
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

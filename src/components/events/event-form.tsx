
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveEvent } from '@/app/events/actions';
import type { Event } from '@/lib/types';
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
    event_date: z.string().optional().nullable(),
});

type EventFormData = z.infer<typeof formSchema>;

export default function EventForm({ event }: { event?: Event | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EventFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: event?.title ?? '',
            description: event?.description ?? '',
            event_date: event?.event_date ?? '',
        },
    });

    const onSubmit = async (values: EventFormData) => {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
            }
        });

        const result = await saveEvent(event?.id ?? null, formData);

        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: result.error,
            });
            setIsSubmitting(false);
        } else {
            toast({
                title: `Event ${event ? 'updated' : 'created'}!`,
                description: `${values.title} has been saved.`,
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="font-headline">Event Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., The Coronation" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="event_date" render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><FormControl><Input placeholder="e.g., 14th of Sun's Height" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the event..." className="min-h-32" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Event'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

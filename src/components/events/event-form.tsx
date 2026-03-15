
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveEvent } from '@/app/events/actions';
import type { Event, Fiction } from '@/lib/types';
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
import { MultiSelect, type MultiSelectOption } from '../ui/multi-select';

const formSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().optional().nullable(),
    event_date: z.string().optional().nullable(),
    fiction_ids: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof formSchema>;

export default function EventForm({ event, fictions }: { event?: Event | null, fictions: Fiction[] }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fictionOptions: MultiSelectOption[] = fictions.map(f => ({ value: f.id, label: f.title }));

    const form = useForm<EventFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: event?.title ?? '',
            description: event?.description ?? '',
            event_date: event?.event_date ?? '',
            fiction_ids: event?.fiction_ids ?? [],
        },
    });

    const onSubmit = async (values: EventFormData) => {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (key === 'fiction_ids' && Array.isArray(value)) {
                value.forEach(id => formData.append('fiction_ids', id));
            }
            else if (value) {
                formData.append(key, value as string);
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

                 <Card>
                    <CardHeader><CardTitle className="font-headline">Associations</CardTitle></CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="fiction_ids"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fictions</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={fictionOptions}
                                            selected={field.value ?? []}
                                            onChange={field.onChange}
                                            placeholder="Select fictions this event belongs to..."
                                        />
                                    </FormControl>
                                    <FormDescription>Link this event to one or more of your fictions.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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

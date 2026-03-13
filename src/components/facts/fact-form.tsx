
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveFact } from '@/app/facts/actions';
import type { WorldFact, WorldTopic } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
    summary: z.string().min(1, 'Summary is required.'),
    details: z.string().optional().nullable(),
    topic_id: z.string().min(1, 'A topic is required.'),
});

type FactFormData = z.infer<typeof formSchema>;

type FactFormProps = {
  fact?: WorldFact | null;
  topics: Pick<WorldTopic, 'id' | 'name'>[];
}

export default function FactForm({ fact, topics }: FactFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FactFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            summary: fact?.summary ?? '',
            details: fact?.details ?? '',
            topic_id: fact?.topic_id ?? '',
        },
    });

    const onSubmit = async (values: FactFormData) => {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
            }
        });

        const result = await saveFact(fact?.id ?? null, formData);

        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: result.error,
            });
            setIsSubmitting(false);
        } else {
            toast({
                title: `Fact ${fact ? 'updated' : 'created'}!`,
                description: `The fact has been saved.`,
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="font-headline">Fact Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="topic_id"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Topic</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a topic for this fact" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {topics.length > 0 ? topics.map(topic => (
                                        <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                                    )) : (
                                        <div className="p-4 text-sm text-center text-muted-foreground">
                                            No topics found. Please <Link href="/topics/new" className="text-primary underline">create a topic</Link> first.
                                        </div>
                                    )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="summary" render={({ field }) => ( <FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea placeholder="A short summary of the fact..." className="min-h-24" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="details" render={({ field }) => ( <FormItem><FormLabel>Details</FormLabel><FormControl><Textarea placeholder="More details about the fact..." className="min-h-32" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || topics.length === 0} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Fact'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

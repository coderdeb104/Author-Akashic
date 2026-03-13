
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveQuote } from '@/app/quotes/actions';
import type { Quote } from '@/lib/types';
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
    text: z.string().min(1, 'Quote text is required.'),
    speaker: z.string().optional().nullable(),
});

type QuoteFormData = z.infer<typeof formSchema>;

export default function QuoteForm({ quote }: { quote?: Quote | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<QuoteFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: quote?.text ?? '',
            speaker: quote?.speaker ?? '',
        },
    });

    const onSubmit = async (values: QuoteFormData) => {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
            }
        });

        const result = await saveQuote(quote?.id ?? null, formData);

        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: result.error,
            });
            setIsSubmitting(false);
        } else {
            toast({
                title: `Quote ${quote ? 'updated' : 'created'}!`,
                description: `The quote has been saved.`,
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="font-headline">Quote Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="text" render={({ field }) => ( <FormItem><FormLabel>Quote</FormLabel><FormControl><Textarea placeholder="e.g., 'Winter is coming.'" className="min-h-24" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="speaker" render={({ field }) => ( <FormItem><FormLabel>Speaker</FormLabel><FormControl><Input placeholder="e.g., Eddard Stark" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Quote'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

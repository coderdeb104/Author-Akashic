
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveWorldbuild } from '@/app/worldbuild/actions';
import type { Worldbuild } from '@/lib/types';
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
    topic: z.string().min(1, 'Topic is required.'),
    fact: z.string().optional().nullable(),
});

type WorldbuildFormData = z.infer<typeof formSchema>;

export default function WorldbuildForm({ entry }: { entry?: Worldbuild | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<WorldbuildFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            topic: entry?.topic ?? '',
            fact: entry?.fact ?? '',
        },
    });

    const onSubmit = async (values: WorldbuildFormData) => {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
            }
        });

        const result = await saveWorldbuild(entry?.id ?? null, formData);

        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: result.error,
            });
            setIsSubmitting(false);
        } else {
            toast({
                title: `Entry ${entry ? 'updated' : 'created'}!`,
                description: `Your worldbuild entry has been saved.`,
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="font-headline">Worldbuild Entry</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="topic" render={({ field }) => ( <FormItem><FormLabel>Topic</FormLabel><FormControl><Input placeholder="e.g., Magic System, Geography, Politics" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="fact" render={({ field }) => ( <FormItem><FormLabel>Fact</FormLabel><FormControl><Textarea placeholder="Describe the piece of lore, rule, or detail..." className="min-h-32" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Entry'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

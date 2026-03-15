
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveWorldbuild } from '@/app/worldbuild/actions';
import type { Worldbuild, Fiction } from '@/lib/types';
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
    topic: z.string().min(1, 'Topic is required.'),
    fact: z.string().optional().nullable(),
    fiction_ids: z.array(z.string()).optional(),
});

type WorldbuildFormData = z.infer<typeof formSchema>;

export default function WorldbuildForm({ entry, fictions }: { entry?: Worldbuild | null, fictions: Fiction[] }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fictionOptions: MultiSelectOption[] = fictions.map(f => ({ value: f.id, label: f.title }));

    const form = useForm<WorldbuildFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            topic: entry?.topic ?? '',
            fact: entry?.fact ?? '',
            fiction_ids: entry?.fiction_ids ?? [],
        },
    });

    const onSubmit = async (values: WorldbuildFormData) => {
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
                                            placeholder="Select fictions this entry belongs to..."
                                        />
                                    </FormControl>
                                    <FormDescription>Link this entry to one or more of your fictions.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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

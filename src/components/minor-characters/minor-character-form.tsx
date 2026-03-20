
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveMinorCharacter } from '@/app/minor-characters/actions';
import type { MinorCharacter, Fiction } from '@/lib/types';
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
    name: z.string().min(1, 'Name is required.'),
    description: z.string().optional().nullable(),
    fiction_ids: z.array(z.string()).optional(),
});

type MinorCharacterFormData = z.infer<typeof formSchema>;

export default function MinorCharacterForm({ character, fictions }: { character?: MinorCharacter | null, fictions: Fiction[] }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fictionOptions: MultiSelectOption[] = fictions.map(f => ({ value: f.id, label: f.title }));

    const form = useForm<MinorCharacterFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: character?.name ?? '',
            description: character?.description ?? '',
            fiction_ids: character?.fiction_ids ?? [],
        },
    });

    const onSubmit = async (values: MinorCharacterFormData) => {
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

        const result = await saveMinorCharacter(character?.id ?? null, formData);

        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: result.error,
            });
            setIsSubmitting(false);
        } else {
            toast({
                title: `Minor Character ${character ? 'updated' : 'created'}!`,
                description: `${values.name} has been saved.`,
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="font-headline">Minor Character Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Village Blacksmith" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the character..." className="min-h-32" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
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
                                            placeholder="Select fictions this character appears in..."
                                        />
                                    </FormControl>
                                    <FormDescription>Link this character to one or more of your fictions.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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

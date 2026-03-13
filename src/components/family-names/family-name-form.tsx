
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveFamilyName } from '@/app/family-names/actions';
import type { FamilyName } from '@/lib/types';
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
    name: z.string().min(1, 'Name is required.'),
    description: z.string().optional().nullable(),
});

type FamilyNameFormData = z.infer<typeof formSchema>;

export default function FamilyNameForm({ familyName }: { familyName?: FamilyName | null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FamilyNameFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: familyName?.name ?? '',
            description: familyName?.description ?? '',
        },
    });

    const onSubmit = async (values: FamilyNameFormData) => {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
            }
        });

        const result = await saveFamilyName(familyName?.id ?? null, formData);

        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: result.error,
            });
            setIsSubmitting(false);
        } else {
            toast({
                title: `Family Name ${familyName ? 'updated' : 'created'}!`,
                description: `${values.name} has been saved.`,
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="font-headline">Family Name Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., House Stark" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the family name..." className="min-h-32" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Saving...' : 'Save Family Name'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

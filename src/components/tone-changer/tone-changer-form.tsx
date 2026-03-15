'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeToneAction } from '@/app/tone-changer/actions';
import { ChangeToneInputSchema, type ChangeToneInput } from '@/ai/flows/change-tone-flow';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';

const exampleTones = [
    'Noble and sophisticated',
    'Casual Gen Z',
    'Loving and caring',
    'Full of hatred and contempt',
    'Formal and professional',
    'Humorous and witty',
    'Mysterious and cryptic',
];

export function ToneChangerForm() {
    const [isPending, startTransition] = useTransition();
    const [resultText, setResultText] = useState('');
    const { toast } = useToast();

    const form = useForm<ChangeToneInput>({
        resolver: zodResolver(ChangeToneInputSchema),
        defaultValues: {
            text: '',
            tone: '',
        },
    });

    const onSubmit = (values: ChangeToneInput) => {
        setResultText('');
        startTransition(async () => {
            const result = await changeToneAction(values);
            if (result.success && result.text) {
                setResultText(result.text);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'AI Generation Failed',
                    description: result.error,
                });
            }
        });
    };
    
    const setExampleTone = (tone: string) => {
        form.setValue('tone', tone, { shouldValidate: true });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Wand2 className="text-primary"/>
                        Input
                    </CardTitle>
                    <CardDescription>Enter the text you want to transform and specify the desired tone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Original Text</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g., I need to finish this report by tomorrow."
                                                className="min-h-[150px] resize-y"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Tone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Annoyed and sarcastic" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Or pick an example:</p>
                                <div className="flex flex-wrap gap-2">
                                    {exampleTones.map(tone => (
                                        <Button key={tone} type="button" variant="outline" size="sm" onClick={() => setExampleTone(tone)}>
                                            {tone}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" disabled={isPending} className="w-full" size="lg">
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                {isPending ? 'Transforming...' : 'Transform Text'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Result</CardTitle>
                    <CardDescription>The transformed text will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center p-6 bg-muted/30 rounded-b-lg">
                    {isPending ? (
                        <div className="flex flex-col items-center text-muted-foreground gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>The AI is working its magic...</p>
                        </div>
                    ) : resultText ? (
                        <p className="text-foreground whitespace-pre-wrap">{resultText}</p>
                    ) : (
                        <p className="text-muted-foreground text-center">Your result will be shown here once you transform some text.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

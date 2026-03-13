
import { createClient } from '@/lib/supabase/server';
import QuoteForm from '@/components/quotes/quote-form';
import { notFound } from 'next/navigation';

export default async function EditQuotePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!quote) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Quote</h1>
      <p className="mt-2 text-muted-foreground">
        Refine this quote.
      </p>
      <div className="mt-8">
        <QuoteForm quote={quote} />
      </div>
    </div>
  );
}

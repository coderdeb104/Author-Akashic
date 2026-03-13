
import QuoteForm from '@/components/quotes/quote-form';

export default function NewQuotePage() {
  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Quote</h1>
      <p className="mt-2 text-muted-foreground">
        Add a memorable quote to your collection.
      </p>
      <div className="mt-8">
        <QuoteForm />
      </div>
    </div>
  );
}

import FictionForm from '@/components/fictions/fiction-form';

export default function NewFictionPage() {
  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Fiction</h1>
      <p className="mt-2 text-muted-foreground">
        Add a new book, series, or story to your collection.
      </p>
      <div className="mt-8">
        <FictionForm />
      </div>
    </div>
  );
}

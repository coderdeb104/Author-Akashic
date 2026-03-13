
import { createClient } from '@/lib/supabase/server';
import PlaceForm from '@/components/places/place-form';
import { notFound } from 'next/navigation';

export default async function EditPlacePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: place } = await supabase
    .from('places')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!place) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Place</h1>
      <p className="mt-2 text-muted-foreground">
        Refine the details of this location.
      </p>
      <div className="mt-8">
        <PlaceForm place={place} />
      </div>
    </div>
  );
}

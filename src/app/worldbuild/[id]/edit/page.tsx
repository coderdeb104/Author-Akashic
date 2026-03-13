
import { createClient } from '@/lib/supabase/server';
import WorldbuildForm from '@/components/worldbuild/worldbuild-form';
import { notFound } from 'next/navigation';

export default async function EditWorldbuildPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: entry } = await supabase
    .from('worldbuild')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!entry) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Worldbuild Entry</h1>
      <p className="mt-2 text-muted-foreground">
        Refine this piece of lore.
      </p>
      <div className="mt-8">
        <WorldbuildForm entry={entry} />
      </div>
    </div>
  );
}

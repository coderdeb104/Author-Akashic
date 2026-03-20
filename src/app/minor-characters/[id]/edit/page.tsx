
import { createClient } from '@/lib/supabase/server';
import MinorCharacterForm from '@/components/minor-characters/minor-character-form';
import { notFound } from 'next/navigation';

export default async function EditMinorCharacterPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: character } = await supabase
    .from('minor_characters')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!character) {
    notFound();
  }

  const { data: fictions } = await supabase
    .from('fictions')
    .select('id, title')
    .order('title');

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Minor Character</h1>
      <p className="mt-2 text-muted-foreground">
        Refine the details of this character.
      </p>
      <div className="mt-8">
        <MinorCharacterForm character={character} fictions={fictions || []} />
      </div>
    </div>
  );
}

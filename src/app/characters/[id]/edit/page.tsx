import { createClient } from '@/lib/supabase/server';
import CharacterForm from '@/components/characters/character-form';
import { notFound } from 'next/navigation';

export default async function EditCharacterPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: character } = await supabase
    .from('characters')
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
    <div className="container mx-auto max-w-4xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Character</h1>
      <p className="mt-2 text-muted-foreground">
        Refine the details of your character's dossier.
      </p>
      <div className="mt-8">
        <CharacterForm character={character} fictions={fictions || []} />
      </div>
    </div>
  );
}

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

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="font-headline text-4xl font-bold text-primary">Edit Character</h1>
      <p className="mt-2 text-muted-foreground">
        Refine the details of your character's dossier.
      </p>
      <div className="mt-8">
        <CharacterForm character={character} />
      </div>
    </div>
  );
}

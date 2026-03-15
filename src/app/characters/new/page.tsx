import CharacterForm from '@/components/characters/character-form';
import { createClient } from '@/lib/supabase/server';

export default async function NewCharacterPage() {
  const supabase = createClient();
  const { data: fictions } = await supabase
    .from('fictions')
    .select('id, title')
    .order('title');

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Character</h1>
      <p className="mt-2 text-muted-foreground">
        Bring a new persona to life. Fill in the details below to add them to your dossier.
      </p>
      <div className="mt-8">
        <CharacterForm fictions={fictions || []}/>
      </div>
    </div>
  );
}

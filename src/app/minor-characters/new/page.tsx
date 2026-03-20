
import MinorCharacterForm from '@/components/minor-characters/minor-character-form';
import { createClient } from '@/lib/supabase/server';

export default async function NewMinorCharacterPage() {
  const supabase = createClient();
  const { data: fictions } = await supabase
    .from('fictions')
    .select('id, title')
    .order('title');

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Minor Character</h1>
      <p className="mt-2 text-muted-foreground">
        Add a new minor character to your world.
      </p>
      <div className="mt-8">
        <MinorCharacterForm fictions={fictions || []} />
      </div>
    </div>
  );
}

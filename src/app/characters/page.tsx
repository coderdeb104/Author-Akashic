import { createClient } from '@/lib/supabase/server';
import type { Character } from '@/lib/types';
import CharacterCard from '@/components/characters/character-card';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function CharactersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: characters, error } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching characters:', error);
  }

  return (
    <div className="container mx-auto">
      {characters && characters.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(characters as Character[]).map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      ) : (
        <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/20 p-12 text-center">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Your Dossier is Empty</h3>
          <p className="mt-2 text-sm text-muted-foreground">Begin by chronicling your first character.</p>
           <Button asChild className="mt-4">
            <Link href="/characters/new">
              Create New Character
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

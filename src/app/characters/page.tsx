
import { createClient } from '@/lib/supabase/server';
import type { Character } from '@/lib/types';
import CharacterCard from '@/components/characters/character-card';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, PlusCircle } from 'lucide-react';

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
    return (
      <div className="container mx-auto">
        <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive bg-card/20 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h3 className="mt-4 font-headline text-2xl font-bold tracking-tight">Error Fetching Characters</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            There was a problem retrieving your character data from the database.
          </p>
          <div className="mt-6 w-full max-w-md rounded-md bg-destructive/10 p-4 text-left text-sm text-destructive-foreground">
            <h4 className="font-bold">Troubleshooting Steps:</h4>
            <p className="mt-2">This error usually means the database isn't set up correctly. Please go to your Supabase project's SQL Editor and ensure you have:</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>A <code className="font-mono text-xs font-bold">characters</code> table.</li>
              <li>Enabled Row Level Security (RLS) on the table.</li>
              <li>Created RLS policies that allow authenticated users to read their own data.</li>
            </ol>
            <p className='mt-2 text-xs'>Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
          <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl">Characters</h1>
          <Button asChild>
              <Link href="/characters/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Character
              </Link>
          </Button>
      </div>
      {characters && characters.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </>
  );
}

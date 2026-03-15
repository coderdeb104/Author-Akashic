
import { createClient } from '@/lib/supabase/server';
import type { Character } from '@/lib/types';
import CharacterCard from '@/components/characters/character-card';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, PlusCircle, SearchX } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { CharacterFilters } from '@/components/characters/character-filters';

export default async function CharactersPage({ searchParams }: { 
  searchParams?: { 
    q?: string;
    race?: string;
    sex?: string;
    vital_status?: string;
    fiction_id?: string;
  } 
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const query = searchParams?.q;
  const raceFilter = searchParams?.race;
  const sexFilter = searchParams?.sex;
  const vitalStatusFilter = searchParams?.vital_status;
  const fictionFilter = searchParams?.fiction_id;

  // Fetch unique races for filter dropdown
  const { data: raceData } = await supabase
    .from('characters')
    .select('race')
    .eq('user_id', user.id);
  const uniqueRaces = Array.from(new Set(raceData?.map(item => item.race).filter(Boolean) as string[])).sort();

  // Fetch fictions for filter dropdown
  const { data: fictionsData } = await supabase
    .from('fictions')
    .select('id, title')
    .eq('user_id', user.id)
    .order('title');

  let characters, error;

  if (query) {
    const { data, error: rpcError } = await supabase.rpc('search_characters', { search_term: query });
    characters = data;
    error = rpcError;
  } else {
    let queryBuilder = supabase
      .from('characters')
      .select('*')
      .eq('user_id', user.id);

    if (raceFilter) queryBuilder = queryBuilder.eq('race', raceFilter);
    if (sexFilter) queryBuilder = queryBuilder.eq('sex', sexFilter);
    if (vitalStatusFilter) queryBuilder = queryBuilder.eq('vital_status', vitalStatusFilter);
    if (fictionFilter) queryBuilder = queryBuilder.contains('fiction_ids', [fictionFilter]);

    const { data: queryData, error: queryError } = await queryBuilder.order('created_at', { ascending: false });
    characters = queryData;
    error = queryError;
  }
  
  if (!query && characters) {
    if (raceFilter) {
      characters = characters.filter((c: Character) => c.race === raceFilter);
    }
    if (sexFilter) {
      characters = characters.filter((c: Character) => c.sex === sexFilter);
    }
    if (vitalStatusFilter) {
      characters = characters.filter((c: Character) => c.vital_status === vitalStatusFilter);
    }
    if (fictionFilter) {
        characters = characters.filter((c: Character) => c.fiction_ids && c.fiction_ids.includes(fictionFilter));
    }
  }
  
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

  const hasActiveFilters = raceFilter || sexFilter || vitalStatusFilter || fictionFilter;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl whitespace-nowrap">Characters</h1>
        <div className="w-full md:w-auto md:flex-1 md:flex md:justify-center">
          <SearchBar placeholder="Search characters..." query={query} />
        </div>
        <Button asChild>
          <Link href="/characters/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New Character</span>
          </Link>
        </Button>
      </div>

      <CharacterFilters 
        races={uniqueRaces}
        fictions={fictionsData || []}
        currentFilters={{ race: raceFilter, sex: sexFilter, vital_status: vitalStatusFilter, fiction_id: fictionFilter }} 
      />

      {(query || hasActiveFilters) && characters && characters.length === 0 && (
        <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/20 p-12 text-center">
            <SearchX className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-headline text-2xl font-bold tracking-tight">No Characters Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Your search or filter criteria did not return any results.
            </p>
            <Button asChild className="mt-4" variant="outline">
                <Link href="/characters">
                    Clear Search & Filters
                </Link>
            </Button>
        </div>
      )}

      {characters && characters.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(characters as Character[]).map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      ) : (
        !query && !hasActiveFilters && (
            <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/20 p-12 text-center">
                <h3 className="font-headline text-2xl font-bold tracking-tight">Your Dossier is Empty</h3>
                <p className="mt-2 text-sm text-muted-foreground">Begin by chronicling your first character.</p>
                <Button asChild className="mt-4">
                    <Link href="/characters/new">
                    Create New Character
                    </Link>
                </Button>
            </div>
        )
      )}
    </>
  );
}

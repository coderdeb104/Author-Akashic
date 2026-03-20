
import { createClient } from '@/lib/supabase/server';
import type { MinorCharacter } from '@/lib/types';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteMinorCharacter } from './actions';
import { SearchBar } from '@/components/search-bar';
import { MinorCharacterFilters } from '@/components/minor-characters/minor-character-filters';

export default async function MinorCharactersPage({ searchParams }: { 
    searchParams?: { 
        q?: string;
        fiction_id?: string;
    } 
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const query = searchParams?.q;
    const fictionFilter = searchParams?.fiction_id;

    const { data: fictionsData } = await supabase
        .from('fictions')
        .select('id, title')
        .eq('user_id', user.id)
        .order('title');

    let characters;

    if (query) {
        const { data } = await supabase.rpc('search_minor_characters', { search_term: query });
        characters = data;
    } else {
        let queryBuilder = supabase
            .from('minor_characters')
            .select('*')
            .eq('user_id', user.id);
        
        if (fictionFilter) {
            queryBuilder = queryBuilder.contains('fiction_ids', [fictionFilter]);
        }

        const { data } = await queryBuilder.order('created_at', { ascending: false });
        characters = data;
    }
    
    if (characters && !query) {
        if (fictionFilter) {
            characters = characters.filter((e: MinorCharacter) => e.fiction_ids && e.fiction_ids.includes(fictionFilter));
        }
    }

    const hasActiveFilters = !!fictionFilter;

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl whitespace-nowrap">Minor Characters</h1>
                <div className="w-full md:w-auto md:flex-1 md:flex md:justify-center">
                    <SearchBar placeholder="Search characters..." query={query} />
                </div>
                <Button asChild>
                    <Link href="/minor-characters/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Character
                    </Link>
                </Button>
            </div>

            <MinorCharacterFilters fictions={fictionsData || []} currentFilters={{ fiction_id: fictionFilter }} />

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {characters && characters.length > 0 ? (
                            (characters as MinorCharacter[]).map((character) => (
                                <TableRow key={character.id}>
                                    <TableCell className="font-medium">{character.name}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-xs">{character.description}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/minor-characters/${character.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                <form action={deleteMinorCharacter.bind(null, character.id)}>
                                                    <DropdownMenuItem asChild>
                                                        <button type="submit" className="w-full text-left">Delete</button>
                                                    </DropdownMenuItem>
                                                </form>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    {query || hasActiveFilters ? `No minor characters found for your criteria.` : 'No minor characters found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

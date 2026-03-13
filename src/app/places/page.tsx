
import { createClient } from '@/lib/supabase/server';
import type { Place } from '@/lib/types';
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
import { deletePlace } from './actions';
import { SearchBar } from '@/components/search-bar';

export default async function PlacesPage({ searchParams }: { searchParams?: { q?: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const query = searchParams?.q;

    const { data: places } = query
        ? await supabase.rpc('search_places', { search_term: query })
        : await supabase
            .from('places')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true });

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl whitespace-nowrap">Places</h1>
                <div className="w-full md:w-auto md:flex-1 md:flex md:justify-center">
                    <SearchBar placeholder="Search places..." query={query} />
                </div>
                <Button asChild>
                    <Link href="/places/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Place
                    </Link>
                </Button>
            </div>
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
                        {places && places.length > 0 ? (
                            (places as Place[]).map((place) => (
                                <TableRow key={place.id}>
                                    <TableCell className="font-medium">{place.name}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-sm">{place.description}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/places/${place.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                <form action={deletePlace.bind(null, place.id)}>
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
                                    {query ? `No places found for "${query}".` : 'No places found. Add your first one!'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

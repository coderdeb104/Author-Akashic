
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
import { PlaceFilters } from '@/components/places/place-filters';

export default async function PlacesPage({ searchParams }: { 
    searchParams?: { 
        q?: string;
        area?: string;
        fiction_id?: string;
    } 
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const query = searchParams?.q;
    const areaFilter = searchParams?.area;
    const fictionFilter = searchParams?.fiction_id;

    const { data: areaData } = await supabase
        .from('places')
        .select('area')
        .eq('user_id', user.id);
    const uniqueAreas = Array.from(new Set(areaData?.map(item => item.area).filter(Boolean) as string[])).sort();

    const { data: fictionsData } = await supabase
        .from('fictions')
        .select('id, title')
        .eq('user_id', user.id)
        .order('title');

    let places;
    if (query) {
        let { data } = await supabase.rpc('search_places', { search_term: query });
        places = data;
    } else {
        let queryBuilder = supabase
            .from('places')
            .select('*')
            .eq('user_id', user.id);
        
        if (areaFilter) {
            queryBuilder = queryBuilder.eq('area', areaFilter);
        }
        if (fictionFilter) {
            queryBuilder = queryBuilder.contains('fiction_ids', [fictionFilter]);
        }
        
        const { data } = await queryBuilder.order('name', { ascending: true });
        places = data;
    }

    if (places && !query) {
        if (areaFilter) {
            places = places.filter((p: Place) => p.area === areaFilter);
        }
        if (fictionFilter) {
            places = places.filter((p: Place) => p.fiction_ids && p.fiction_ids.includes(fictionFilter));
        }
    }


    const hasActiveFilters = !!areaFilter || !!fictionFilter;

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

            <PlaceFilters
                areas={uniqueAreas}
                fictions={fictionsData || []}
                currentFilters={{ area: areaFilter, fiction_id: fictionFilter }}
            />

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {places && places.length > 0 ? (
                            (places as Place[]).map((place) => (
                                <TableRow key={place.id}>
                                    <TableCell className="font-medium">{place.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{place.area}</TableCell>
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
                                <TableCell colSpan={4} className="h-24 text-center">
                                    {query || hasActiveFilters ? `No places found.` : 'No places found. Add your first one!'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

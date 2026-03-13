
import { createClient } from '@/lib/supabase/server';
import type { Worldbuild } from '@/lib/types';
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
import { deleteWorldbuild } from './actions';
import { SearchBar } from '@/components/search-bar';
import { WorldbuildFilters } from '@/components/worldbuild/worldbuild-filters';

export default async function WorldbuildPage({ searchParams }: { 
    searchParams?: { 
        q?: string;
        topic?: string;
    } 
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }
    
    const query = searchParams?.q;
    const topicFilter = searchParams?.topic;

    const { data: topicData } = await supabase
        .from('worldbuild')
        .select('topic')
        .eq('user_id', user.id);
    const uniqueTopics = Array.from(new Set(topicData?.map(item => item.topic).filter(Boolean) as string[])).sort();

    let worldbuilds;
    if (query) {
        let { data } = await supabase.rpc('search_worldbuild', { search_term: query });
        if (topicFilter && data) {
            worldbuilds = data.filter((entry: Worldbuild) => entry.topic === topicFilter);
        } else {
            worldbuilds = data;
        }
    } else {
        let queryBuilder = supabase
            .from('worldbuild')
            .select('*')
            .eq('user_id', user.id);
        
        if (topicFilter) {
            queryBuilder = queryBuilder.eq('topic', topicFilter);
        }
        
        const { data } = await queryBuilder
            .order('topic', { ascending: true })
            .order('created_at', { ascending: false });
        worldbuilds = data;
    }

    const hasActiveFilters = !!topicFilter;

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl whitespace-nowrap">Worldbuild</h1>
                <div className="w-full md:w-auto md:flex-1 md:flex md:justify-center">
                    <SearchBar placeholder="Search worldbuild..." query={query} />
                </div>
                <Button asChild>
                    <Link href="/worldbuild/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Entry
                    </Link>
                </Button>
            </div>
            
            <WorldbuildFilters
                topics={uniqueTopics}
                currentFilters={{ topic: topicFilter }}
            />

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Topic</TableHead>
                            <TableHead>Fact</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {worldbuilds && worldbuilds.length > 0 ? (
                            (worldbuilds as Worldbuild[]).map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium">{entry.topic}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-sm">{entry.fact}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/worldbuild/${entry.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                <form action={deleteWorldbuild.bind(null, entry.id)}>
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
                                    {query || hasActiveFilters ? `No entries found.` : 'No worldbuild entries found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

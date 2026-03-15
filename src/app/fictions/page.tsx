import { createClient } from '@/lib/supabase/server';
import type { Fiction } from '@/lib/types';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, BookCopy } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteFiction } from './actions';
import { SearchBar } from '@/components/search-bar';

export default async function FictionsPage({ searchParams }: { searchParams?: { q?: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const query = searchParams?.q;

    const { data: fictions } = query
        ? await supabase.rpc('search_fictions', { search_term: query })
        : await supabase
            .from('fictions')
            .select('*')
            .eq('user_id', user.id)
            .order('title', { ascending: true });

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl whitespace-nowrap">Fictions</h1>
                <div className="w-full md:w-auto md:flex-1 md:flex md:justify-center">
                    <SearchBar placeholder="Search fictions..." query={query} />
                </div>
                <Button asChild>
                    <Link href="/fictions/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Fiction
                    </Link>
                </Button>
            </div>
            {fictions && fictions.length > 0 ? (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(fictions as Fiction[]).map((fiction) => (
                                <TableRow key={fiction.id}>
                                    <TableCell className="font-medium">{fiction.title}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-sm">{fiction.description}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/fictions/${fiction.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                <form action={deleteFiction.bind(null, fiction.id)}>
                                                    <DropdownMenuItem asChild>
                                                        <button type="submit" className="w-full text-left">Delete</button>
                                                    </DropdownMenuItem>
                                                </form>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/20 p-12 text-center">
                    <BookCopy className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 font-headline text-2xl font-bold tracking-tight">No Fictions Yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Start by adding your first book, series, or story.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/fictions/new">
                        Create New Fiction
                        </Link>
                    </Button>
                </div>
            )}
        </>
    );
}

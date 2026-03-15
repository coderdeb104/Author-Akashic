
import { createClient } from '@/lib/supabase/server';
import type { Fiction } from '@/lib/types';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, BookCopy, SearchX } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { FictionCard } from '@/components/fictions/fiction-card';

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
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {(fictions as Fiction[]).map((fiction) => (
                        <FictionCard key={fiction.id} fiction={fiction} />
                    ))}
                </div>
            ) : (
                 <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/20 p-12 text-center">
                    {query ? (
                        <>
                            <SearchX className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 font-headline text-2xl font-bold tracking-tight">No Fictions Found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Your search did not return any results.
                            </p>
                            <Button asChild className="mt-4" variant="outline">
                                <Link href="/fictions">
                                    Clear Search
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            )}
        </>
    );
}

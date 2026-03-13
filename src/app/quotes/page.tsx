
import { createClient } from '@/lib/supabase/server';
import type { Quote } from '@/lib/types';
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
import { deleteQuote } from './actions';
import { SearchBar } from '@/components/search-bar';
import { QuoteFilters } from '@/components/quotes/quote-filters';

export default async function QuotesPage({ searchParams }: { 
    searchParams?: { 
        q?: string;
        speaker?: string;
    } 
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const query = searchParams?.q;
    const speakerFilter = searchParams?.speaker;

    const { data: speakerData } = await supabase
        .from('quotes')
        .select('speaker')
        .eq('user_id', user.id);
    const uniqueSpeakers = Array.from(new Set(speakerData?.map(item => item.speaker).filter(Boolean) as string[])).sort();

    let quotes;
    if (query) {
        let { data } = await supabase.rpc('search_quotes', { search_term: query });
        if (speakerFilter && data) {
            quotes = data.filter((q: Quote) => q.speaker === speakerFilter);
        } else {
            quotes = data;
        }
    } else {
        let queryBuilder = supabase
            .from('quotes')
            .select('*')
            .eq('user_id', user.id);

        if (speakerFilter) {
            queryBuilder = queryBuilder.eq('speaker', speakerFilter);
        }

        const { data } = await queryBuilder.order('created_at', { ascending: false });
        quotes = data;
    }

    const hasActiveFilters = !!speakerFilter;

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl whitespace-nowrap">Quotes</h1>
                <div className="w-full md:w-auto md:flex-1 md:flex md:justify-center">
                    <SearchBar placeholder="Search quotes..." query={query} />
                </div>
                <Button asChild>
                    <Link href="/quotes/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Quote
                    </Link>
                </Button>
            </div>

            <QuoteFilters
                speakers={uniqueSpeakers}
                currentFilters={{ speaker: speakerFilter }}
            />

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quote</TableHead>
                            <TableHead>Speaker</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes && quotes.length > 0 ? (
                            (quotes as Quote[]).map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-medium whitespace-pre-wrap">"{quote.text}"</TableCell>
                                    <TableCell className="text-muted-foreground">{quote.speaker}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/quotes/${quote.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                <form action={deleteQuote.bind(null, quote.id)}>
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
                                    {query || hasActiveFilters ? `No quotes found.` : 'No quotes found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

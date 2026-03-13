
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

export default async function QuotesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl">Quotes</h1>
                <Button asChild>
                    <Link href="/quotes/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Quote
                    </Link>
                </Button>
            </div>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quote</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes && quotes.length > 0 ? (
                            (quotes as Quote[]).map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-medium whitespace-pre-wrap">"{quote.text}"</TableCell>
                                    <TableCell className="text-muted-foreground">{quote.author}</TableCell>
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
                                    No quotes found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}


import { createClient } from '@/lib/supabase/server';
import type { Event } from '@/lib/types';
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
import { deleteEvent } from './actions';
import { SearchBar } from '@/components/search-bar';

export default async function EventsPage({ searchParams }: { searchParams?: { q?: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const query = searchParams?.q;

    const { data: events } = query
        ? await supabase.rpc('search_events', { search_term: query })
        : await supabase
            .from('events')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl whitespace-nowrap">Events</h1>
                <div className="w-full md:w-auto md:flex-1 md:flex md:justify-center">
                    <SearchBar placeholder="Search events..." query={query} />
                </div>
                <Button asChild>
                    <Link href="/events/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Event
                    </Link>
                </Button>
            </div>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events && events.length > 0 ? (
                            (events as Event[]).map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{event.title}</TableCell>
                                    <TableCell>{event.event_date}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-xs">{event.description}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/events/${event.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                <form action={deleteEvent.bind(null, event.id)}>
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
                                    {query ? `No events found for "${query}".` : 'No events found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}


import { createClient } from '@/lib/supabase/server';
import type { WorldFact } from '@/lib/types';
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
import { deleteFact } from './actions';

type FactWithTopic = WorldFact & {
    world_topics: {
        name: string;
    } | null;
}

export default async function FactsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: facts } = await supabase
        .from('world_facts')
        .select('*, world_topics(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl">Facts</h1>
                <Button asChild>
                    <Link href="/facts/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Fact
                    </Link>
                </Button>
            </div>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Summary</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {facts && facts.length > 0 ? (
                            (facts as FactWithTopic[]).map((fact) => (
                                <TableRow key={fact.id}>
                                    <TableCell className="font-medium">{fact.summary}</TableCell>
                                    <TableCell className="text-muted-foreground">{fact.world_topics?.name ?? 'N/A'}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-xs">{fact.details}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/facts/${fact.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                <form action={deleteFact.bind(null, fact.id)}>
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
                                    No facts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

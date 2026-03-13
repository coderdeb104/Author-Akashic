
import { createClient } from '@/lib/supabase/server';
import type { WorldTopic } from '@/lib/types';
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
import { deleteTopic } from './actions';

export default async function TopicsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: topics } = await supabase
        .from('world_topics')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl">Topics</h1>
                <Button asChild>
                    <Link href="/topics/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Topic
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
                        {topics && topics.length > 0 ? (
                            (topics as WorldTopic[]).map((topic) => (
                                <TableRow key={topic.id}>
                                    <TableCell className="font-medium">{topic.name}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-sm">{topic.description}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/topics/${topic.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                <form action={deleteTopic.bind(null, topic.id)}>
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
                                    No topics found. Add your first one!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

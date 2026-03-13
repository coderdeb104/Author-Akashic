
import { createClient } from '@/lib/supabase/server';
import type { FamilyName } from '@/lib/types';
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
import { deleteFamilyName } from './actions';

export default async function FamilyNamesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: familyNames } = await supabase
        .from('family_names')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl">Family Names</h1>
                <Button asChild>
                    <Link href="/family-names/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Family Name
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
                        {familyNames && familyNames.length > 0 ? (
                            (familyNames as FamilyName[]).map((familyName) => (
                                <TableRow key={familyName.id}>
                                    <TableCell className="font-medium">{familyName.name}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-sm">{familyName.description}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/family-names/${familyName.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                <form action={deleteFamilyName.bind(null, familyName.id)}>
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
                                    No family names found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

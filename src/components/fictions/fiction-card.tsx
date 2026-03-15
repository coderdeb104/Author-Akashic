
'use client';

import type { Fiction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import { deleteFiction } from '@/app/fictions/actions';

export function FictionCard({ fiction }: { fiction: Fiction }) {
  return (
      <Card className="h-full flex flex-col group overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
        <Link href={`/fictions/${fiction.id}/edit`} className="flex-grow flex flex-col">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={fiction.image_url || `https://picsum.photos/seed/${fiction.id}/400/600`}
              alt={fiction.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint="book cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          <CardHeader className='pb-2 flex-row justify-between items-start'>
            <CardTitle className="font-headline text-xl leading-tight line-clamp-2">{fiction.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription className="line-clamp-3">
              {fiction.description}
            </CardDescription>
          </CardContent>
        </Link>
        <CardFooter className="flex flex-col items-start gap-2">
            {fiction.genres && fiction.genres.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">GENRES</h4>
                    <div className="flex flex-wrap gap-1">
                        {fiction.genres.slice(0, 3).map((genre) => (
                            <Badge key={genre} variant="secondary">{genre}</Badge>
                        ))}
                         {fiction.genres.length > 3 && (
                            <Badge variant="outline">+{fiction.genres.length - 3}</Badge>
                        )}
                    </div>
                </div>
            )}
        </CardFooter>
        <div className="absolute top-2 right-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 opacity-80 hover:opacity-100">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild><Link href={`/fictions/${fiction.id}/edit`}>Edit</Link></DropdownMenuItem>
                    <form action={deleteFiction.bind(null, fiction.id)} className='w-full'>
                        <DropdownMenuItem asChild>
                            <button type="submit" className="w-full text-left text-destructive">Delete</button>
                        </DropdownMenuItem>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </Card>
  );
}

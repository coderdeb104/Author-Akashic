"use client";

import { useState } from 'react';
import type { Character } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import CharacterDossier from './character-dossier';

export default function CharacterCard({ character }: { character: Character }) {
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  return (
    <>
      <Card
        className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-primary/20 bg-card transition-all duration-300 hover:border-primary hover:shadow-[0_0_30px_-5px_hsl(var(--primary))]"
        onClick={() => setIsDossierOpen(true)}
        role="button"
        aria-label={`View details for ${character.name}`}
      >
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={character.image_url || `https://picsum.photos/seed/${character.id}/600/800`}
              alt={character.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="fantasy character"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 w-full p-4 text-white">
            <h3 className="font-headline text-xl font-bold tracking-tight text-primary-foreground">{character.name}</h3>
            <p className="mt-1 truncate text-sm text-primary-foreground/80">{character.intro}</p>
          </div>
        </CardContent>
      </Card>
      <CharacterDossier character={character} isOpen={isDossierOpen} onOpenChange={setIsDossierOpen} />
    </>
  );
}

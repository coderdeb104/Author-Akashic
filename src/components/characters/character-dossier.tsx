"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Character } from '@/lib/types';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Users, Cake, VenetianMask, FileText, Sparkles, BookOpen, User, Bot } from 'lucide-react';

export default function CharacterDossier({
  character,
  isOpen,
  onOpenChange,
}: {
  character: Character;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 border-primary/50 shadow-lg shadow-primary/20">
        <ScrollArea className="max-h-[90vh]">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="relative col-span-1 h-64 min-h-[300px] md:h-auto">
              <Image
                src={character.image_url || `https://picsum.photos/seed/${character.id}/600/800`}
                alt={character.name}
                fill
                className="object-cover md:rounded-l-lg"
                data-ai-hint="fantasy character portrait"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent md:bg-gradient-to-r" />
            </div>
            <div className="col-span-1 p-6 md:col-span-2">
              <DialogHeader>
                <DialogTitle className="font-headline text-4xl text-primary">{character.name}</DialogTitle>
                <DialogDescription className="text-lg text-muted-foreground">{character.intro}</DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <InfoItem icon={User} label="Sex" value={character.sex} />
                  <InfoItem icon={Cake} label="Age" value={character.age?.toString()} />
                  <InfoItem icon={Bot} label="Role" value={character.role} />
                </div>

                {character.appearance && (
                  <Section icon={Sparkles} title="Appearance">
                      <p className='text-muted-foreground'><strong className='text-foreground'>Height:</strong> {character.appearance.height || 'N/A'}</p>
                      <p className='text-muted-foreground'><strong className='text-foreground'>Hair:</strong> {character.appearance.hair || 'N/A'}</p>
                      <p className='text-muted-foreground'><strong className='text-foreground'>Eyes:</strong> {character.appearance.eyes || 'N/A'}</p>
                      <p className='text-muted-foreground'><strong className='text-foreground'>Features:</strong> {character.appearance.distinguishing_features || 'N/A'}</p>
                  </Section>
                )}
                
                {character.description && (
                  <Section icon={FileText} title="Description">
                    <p className="whitespace-pre-wrap text-muted-foreground">{character.description}</p>
                  </Section>
                )}
                
                {character.trivia && (
                  <Section icon={BookOpen} title="Trivia">
                    <p className="whitespace-pre-wrap text-muted-foreground">{character.trivia}</p>
                  </Section>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) {
    return (
        <div>
            <h4 className="flex items-center font-headline text-xl font-semibold text-accent mb-2">
                <Icon className="mr-2 h-5 w-5 text-primary" />
                {title}
            </h4>
            <div className="space-y-2 text-sm">
                {children}
            </div>
        </div>
    )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center space-x-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-foreground font-medium">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}

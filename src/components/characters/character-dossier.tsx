"use client";

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Character } from '@/lib/types';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Cake, BookOpen, Bot, FileText, Loader2, Pencil, Sparkles, Trash2, User, Heart, Users, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { deleteCharacter } from '@/app/characters/actions';
import { useToast } from '@/hooks/use-toast';


export default function CharacterDossier({
  character,
  isOpen,
  onOpenChange,
}: {
  character: Character;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCharacter(character.id);
      if (result?.error) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: result.error,
        });
      } else {
        toast({
            title: 'Character Deleted',
            description: `${character.name} has been removed from your dossier.`,
        });
        onOpenChange(false);
      }
    });
  }

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
            <div className="col-span-1 flex flex-col p-4 sm:p-6 md:col-span-2">
              <DialogHeader>
                <DialogTitle className="font-headline text-3xl text-primary sm:text-4xl">{character.name}</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground sm:text-lg">{character.intro}</DialogDescription>
              </DialogHeader>

              <div className="mt-6 flex-1 space-y-6">
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <InfoItem icon={User} label="Sex" value={character.sex} />
                  <InfoItem icon={Cake} label="Age" value={character.age?.toString()} />
                  <InfoItem icon={Users} label="Race" value={character.race} />
                  <InfoItem icon={Heart} label="Spouse" value={character.spouse} />
                  <InfoItem icon={HeartPulse} label="Vital Status" value={character.vital_status} />
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
              <DialogFooter className="pt-6">
                  <Button asChild variant="outline">
                      <Link href={`/characters/${character.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                      </Link>
                  </Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete {character.name} and remove all associated data from our servers.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Continue
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </DialogFooter>
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
            <h4 className="flex items-center font-headline text-lg font-semibold text-accent sm:text-xl mb-2">
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

import CharacterForm from '@/components/characters/character-form';

export default function NewCharacterPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Character</h1>
      <p className="mt-2 text-muted-foreground">
        Bring a new persona to life. Fill in the details below to add them to your dossier.
      </p>
      <div className="mt-8">
        <CharacterForm />
      </div>
    </div>
  );
}

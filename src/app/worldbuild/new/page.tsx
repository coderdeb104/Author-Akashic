
import WorldbuildForm from '@/components/worldbuild/worldbuild-form';

export default function NewWorldbuildPage() {
  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Worldbuild Entry</h1>
      <p className="mt-2 text-muted-foreground">
        Add a new piece of lore to your world.
      </p>
      <div className="mt-8">
        <WorldbuildForm />
      </div>
    </div>
  );
}

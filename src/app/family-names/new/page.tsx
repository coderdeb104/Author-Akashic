
import FamilyNameForm from '@/components/family-names/family-name-form';

export default function NewFamilyNamePage() {
  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Family Name</h1>
      <p className="mt-2 text-muted-foreground">
        Add a new family name to your world.
      </p>
      <div className="mt-8">
        <FamilyNameForm />
      </div>
    </div>
  );
}

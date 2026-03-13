
import PlaceForm from '@/components/places/place-form';

export default function NewPlacePage() {
  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Place</h1>
      <p className="mt-2 text-muted-foreground">
        Add a new location to your world.
      </p>
      <div className="mt-8">
        <PlaceForm />
      </div>
    </div>
  );
}

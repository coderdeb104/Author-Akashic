
import FamilyNameForm from '@/components/family-names/family-name-form';
import { createClient } from '@/lib/supabase/server';

export default async function NewFamilyNamePage() {
  const supabase = createClient();
  const { data: fictions } = await supabase
    .from('fictions')
    .select('id, title')
    .order('title');

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Family Name</h1>
      <p className="mt-2 text-muted-foreground">
        Add a new family name to your world.
      </p>
      <div className="mt-8">
        <FamilyNameForm fictions={fictions || []} />
      </div>
    </div>
  );
}

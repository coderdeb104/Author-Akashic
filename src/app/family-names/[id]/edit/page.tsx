
import { createClient } from '@/lib/supabase/server';
import FamilyNameForm from '@/components/family-names/family-name-form';
import { notFound } from 'next/navigation';

export default async function EditFamilyNamePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: familyName } = await supabase
    .from('family_names')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!familyName) {
    notFound();
  }

  const { data: fictions } = await supabase
    .from('fictions')
    .select('id, title')
    .order('title');

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Family Name</h1>
      <p className="mt-2 text-muted-foreground">
        Refine the details of this family name.
      </p>
      <div className="mt-8">
        <FamilyNameForm familyName={familyName} fictions={fictions || []} />
      </div>
    </div>
  );
}

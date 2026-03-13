
import FactForm from '@/components/facts/fact-form';
import { createClient } from '@/lib/supabase/server';

export default async function NewFactPage() {
  const supabase = createClient();
  const { data: topics } = await supabase.from('world_topics').select('id, name').order('name');

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Fact</h1>
      <p className="mt-2 text-muted-foreground">
        Add a new worldbuilding fact.
      </p>
      <div className="mt-8">
        <FactForm topics={topics || []} />
      </div>
    </div>
  );
}

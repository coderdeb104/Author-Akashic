
import { createClient } from '@/lib/supabase/server';
import FactForm from '@/components/facts/fact-form';
import { notFound } from 'next/navigation';

export default async function EditFactPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const factResult = await supabase
    .from('world_facts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (factResult.error || !factResult.data) {
    notFound();
  }

  const topicsResult = await supabase.from('world_topics').select('id, name').order('name');

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Fact</h1>
      <p className="mt-2 text-muted-foreground">
        Refine the details of this fact.
      </p>
      <div className="mt-8">
        <FactForm fact={factResult.data} topics={topicsResult.data || []} />
      </div>
    </div>
  );
}

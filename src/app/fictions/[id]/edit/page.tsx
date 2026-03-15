import { createClient } from '@/lib/supabase/server';
import FictionForm from '@/components/fictions/fiction-form';
import { notFound } from 'next/navigation';

export default async function EditFictionPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: fiction } = await supabase
    .from('fictions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!fiction) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Fiction</h1>
      <p className="mt-2 text-muted-foreground">
        Refine the details of this work.
      </p>
      <div className="mt-8">
        <FictionForm fiction={fiction} />
      </div>
    </div>
  );
}

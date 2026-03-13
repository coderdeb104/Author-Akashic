
import { createClient } from '@/lib/supabase/server';
import TopicForm from '@/components/topics/topic-form';
import { notFound } from 'next/navigation';

export default async function EditTopicPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: topic } = await supabase
    .from('world_topics')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!topic) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Topic</h1>
      <p className="mt-2 text-muted-foreground">
        Refine the details of this topic.
      </p>
      <div className="mt-8">
        <TopicForm topic={topic} />
      </div>
    </div>
  );
}

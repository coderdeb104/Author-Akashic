
import { createClient } from '@/lib/supabase/server';
import EventForm from '@/components/events/event-form';
import { notFound } from 'next/navigation';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Edit Event</h1>
      <p className="mt-2 text-muted-foreground">
        Refine the details of this event.
      </p>
      <div className="mt-8">
        <EventForm event={event} />
      </div>
    </div>
  );
}

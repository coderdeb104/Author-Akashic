
import EventForm from '@/components/events/event-form';

export default function NewEventPage() {
  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Event</h1>
      <p className="mt-2 text-muted-foreground">
        Chronicle a new event in your world's timeline.
      </p>
      <div className="mt-8">
        <EventForm />
      </div>
    </div>
  );
}


import { Calendar } from 'lucide-react';

export default function EventsPage() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/20 p-12 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 font-headline text-2xl font-bold tracking-tight">Events</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        This section is under construction.
      </p>
    </div>
  );
}

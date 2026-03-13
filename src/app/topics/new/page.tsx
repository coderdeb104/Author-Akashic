
import TopicForm from '@/components/topics/topic-form';

export default function NewTopicPage() {
  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Create New Topic</h1>
      <p className="mt-2 text-muted-foreground">
        Add a new worldbuilding topic.
      </p>
      <div className="mt-8">
        <TopicForm />
      </div>
    </div>
  );
}

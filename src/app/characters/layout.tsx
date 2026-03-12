import AppHeader from '@/components/app-header';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CharactersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={user} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

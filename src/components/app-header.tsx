'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { PlusCircle, LogOut, Wand2 } from "lucide-react";

export default function AppHeader({ user }: { user: User | null }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/characters" className="mr-6 flex items-center space-x-2">
          <Wand2 className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-bold">Writer Akashic</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user && (
            <>
              <Button asChild size="sm">
                <Link href="/characters/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Character
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

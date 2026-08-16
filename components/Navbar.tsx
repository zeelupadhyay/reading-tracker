"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={user ? "/books" : "/login"} className="flex items-center gap-2 font-semibold">
            <BookMarked className="h-5 w-5 text-primary" />
            Reading Tracker
          </Link>
          {user && (
            <nav className="hidden gap-4 text-sm text-muted-foreground sm:flex">
              <Link href="/books" className="hover:text-foreground">
                My Books
              </Link>
              <Link href="/reading-list" className="hover:text-foreground">
                Currently Reading
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {user && (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

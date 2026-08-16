"use client";

import { createContext, useContext, type ReactNode } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, type Book } from "@/lib/types";

// ---------------------------------------------------------------------------
// Compound component pattern: <BookCard book={book}> owns the book via
// context so its children (Header / Progress / Actions) don't need props
// drilled through, while still being composed explicitly by the caller.
// ---------------------------------------------------------------------------

const BookCardContext = createContext<Book | null>(null);

function useBookCardContext() {
  const ctx = useContext(BookCardContext);
  if (!ctx) throw new Error("BookCard.* must be rendered inside <BookCard>");
  return ctx;
}

interface BookCardRootProps {
  book: Book;
  children: ReactNode;
  className?: string;
}

function BookCardRoot({ book, children, className }: BookCardRootProps) {
  return (
    <BookCardContext.Provider value={book}>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:shadow-md",
          className
        )}
      >
        {children}
      </div>
    </BookCardContext.Provider>
  );
}

const statusStyles: Record<Book["status"], string> = {
  to_read: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  finished: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

function Header() {
  const book = useBookCardContext();
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="line-clamp-2 font-semibold leading-snug">{book.title}</h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-1 text-xs font-medium",
          statusStyles[book.status]
        )}
      >
        {STATUS_LABELS[book.status]}
      </span>
    </div>
  );
}

function Progress() {
  const book = useBookCardContext();
  const pct =
    book.total_pages > 0
      ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-1.5">
      {book.genre && (
        <p className="text-xs text-muted-foreground">{book.genre}</p>
      )}

      {book.status === "finished" && book.rating ? (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < (book.rating ?? 0)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              )}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {book.current_page} / {book.total_pages} pages ({pct}%)
          </p>
        </>
      )}

      {book.target_finish_date && (
        <p className="text-xs text-muted-foreground">
          Target: {new Date(book.target_finish_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

interface ActionsProps {
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

function Actions({ onEdit, onDelete }: ActionsProps) {
  const book = useBookCardContext();
  return (
    <div className="mt-1 flex justify-end gap-2 border-t border-border pt-3">
      <Button variant="outline" size="sm" onClick={() => onEdit(book)}>
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(book)}>
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
    </div>
  );
}

export const BookCard = Object.assign(BookCardRoot, {
  Header,
  Progress,
  Actions,
});

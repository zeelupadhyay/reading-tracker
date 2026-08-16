import { BookX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters: boolean;
  onAddBook: () => void;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onAddBook, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <BookX className="h-10 w-10 text-muted-foreground" />
      {hasFilters ? (
        <>
          <p className="font-medium">No books match your search or filter</p>
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        </>
      ) : (
        <>
          <p className="font-medium">Your reading list is empty</p>
          <p className="text-sm text-muted-foreground">
            Add your first book to start tracking your progress.
          </p>
          <Button onClick={onAddBook}>Add a book</Button>
        </>
      )}
    </div>
  );
}

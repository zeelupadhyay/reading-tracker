"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { SummaryBanner } from "@/components/SummaryBanner";
import { BookForm } from "@/components/BookForm";
import { BookCard } from "@/components/BookCard";
import { ConfirmModal } from "@/components/ConfirmModal";
import { BookListSkeleton } from "@/components/BookListSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useBooks } from "@/hooks/useBooks";
import { useDebounce } from "@/hooks/useDebounce";
import type { BookFormValues } from "@/lib/validations/book";
import type { Book, BookStatus } from "@/lib/types";

interface BooksViewProps {
  title: string;
  subtitle: string;
  /** Locks the status filter to a single value and hides the filter bar. */
  fixedStatus?: BookStatus;
}

export function BooksView({ title, subtitle, fixedStatus }: BooksViewProps) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState<BookStatus | "all">(
    fixedStatus ?? "all"
  );

  const { books, loading, mutating, stats, addBook, updateBook, deleteBook } =
    useBooks({
      search: debouncedSearch,
      statusFilter: fixedStatus ?? statusFilter,
    });

  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const hasFilters = useMemo(
    () => debouncedSearch.trim().length > 0 || (!fixedStatus && statusFilter !== "all"),
    [debouncedSearch, statusFilter, fixedStatus]
  );

  const openAddForm = () => {
    setEditingBook(null);
    setFormOpen(true);
  };

  const openEditForm = (book: Book) => {
    setEditingBook(book);
    setFormOpen(true);
  };

  const handleSubmit = async (values: BookFormValues) => {
    const payload = {
      title: values.title,
      author: values.author,
      total_pages: values.total_pages,
      current_page: values.current_page,
      genre: values.genre || null,
      target_finish_date: values.target_finish_date || null,
      status: values.status,
      rating: values.status === "finished" ? values.rating ?? null : null,
    };

    if (editingBook) {
      const result = await updateBook(editingBook.id, payload);
      if (result) setFormOpen(false);
    } else {
      const result = await addBook(payload);
      if (result) setFormOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBook) return;
    const ok = await deleteBook(deletingBook.id, deletingBook.title);
    if (ok) setDeletingBook(null);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="h-4 w-4" />
          Add book
        </Button>
      </div>

      <SummaryBanner
        total={stats.total}
        finished={stats.finished}
        inProgress={stats.inProgress}
        toRead={stats.toRead}
        completionRate={stats.completionRate}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={searchInput} onChange={setSearchInput} />
        {!fixedStatus && <FilterBar value={statusFilter} onChange={setStatusFilter} />}
      </div>

      {loading ? (
        <BookListSkeleton />
      ) : books.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onAddBook={openAddForm}
          onClearFilters={() => {
            setSearchInput("");
            setStatusFilter(fixedStatus ?? "all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book}>
              <BookCard.Header />
              <BookCard.Progress />
              <BookCard.Actions onEdit={openEditForm} onDelete={setDeletingBook} />
            </BookCard>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBook ? "Edit book" : "Add a book"}</DialogTitle>
          </DialogHeader>
          <BookForm
            defaultValues={editingBook ?? undefined}
            submitting={mutating}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deletingBook}
        onOpenChange={(open) => !open && setDeletingBook(null)}
        title="Remove this book?"
        description={`"${deletingBook?.title}" will be permanently removed from your reading list. This can't be undone.`}
        onConfirm={handleDelete}
        loading={mutating}
      />
    </div>
  );
}

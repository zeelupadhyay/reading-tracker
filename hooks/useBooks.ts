"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Book, BookInsert, BookStatus, BookUpdate } from "@/lib/types";

interface UseBooksOptions {
  search: string;
  statusFilter: BookStatus | "all";
}

export function useBooks({ search, statusFilter }: UseBooksOptions) {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();

  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  const fetchBooks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(`Failed to load books: ${error.message}`);
    } else {
      setAllBooks(data as Book[]);
    }
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Client-side search + filter over the fetched set. Debouncing happens
  // upstream (the caller passes an already-debounced `search` string).
  const books = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allBooks.filter((b) => {
      const matchesQuery =
        q.length === 0 ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [allBooks, search, statusFilter]);

  // Required by the spec: completion rate must be derived with useMemo and
  // recompute automatically whenever the underlying book list changes.
  const stats = useMemo(() => {
    const total = allBooks.length;
    const finished = allBooks.filter((b) => b.status === "finished").length;
    const inProgress = allBooks.filter((b) => b.status === "in_progress").length;
    const toRead = allBooks.filter((b) => b.status === "to_read").length;
    const completionRate = total === 0 ? 0 : Math.round((finished / total) * 100);
    return { total, finished, inProgress, toRead, completionRate };
  }, [allBooks]);

  const addBook = useCallback(
    async (values: BookInsert) => {
      if (!user) return;
      setMutating(true);
      const { data, error } = await supabase
        .from("books")
        .insert({ ...values, user_id: user.id })
        .select()
        .single();
      setMutating(false);

      if (error) {
        toast.error(`Couldn't add book: ${error.message}`);
        return null;
      }
      setAllBooks((prev) => [data as Book, ...prev]);
      toast.success(`"${values.title}" added to your list`);
      return data as Book;
    },
    [supabase, user]
  );

  const updateBook = useCallback(
    async (id: string, values: BookUpdate) => {
      setMutating(true);
      const { data, error } = await supabase
        .from("books")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      setMutating(false);

      if (error) {
        toast.error(`Couldn't update book: ${error.message}`);
        return null;
      }
      setAllBooks((prev) => prev.map((b) => (b.id === id ? (data as Book) : b)));
      toast.success("Book updated");
      return data as Book;
    },
    [supabase]
  );

  const deleteBook = useCallback(
    async (id: string, title: string) => {
      setMutating(true);
      const { error } = await supabase.from("books").delete().eq("id", id);
      setMutating(false);

      if (error) {
        toast.error(`Couldn't delete book: ${error.message}`);
        return false;
      }
      setAllBooks((prev) => prev.filter((b) => b.id !== id));
      toast.success(`"${title}" removed from your list`);
      return true;
    },
    [supabase]
  );

  return {
    books,
    allBooksCount: allBooks.length,
    loading,
    mutating,
    stats,
    addBook,
    updateBook,
    deleteBook,
    refetch: fetchBooks,
  };
}

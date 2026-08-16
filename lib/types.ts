export type BookStatus = "to_read" | "in_progress" | "finished";

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  total_pages: number;
  current_page: number;
  genre: string | null;
  target_finish_date: string | null;
  status: BookStatus;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export type BookInsert = Omit<
  Book,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type BookUpdate = Partial<BookInsert>;

export const STATUS_LABELS: Record<BookStatus, string> = {
  to_read: "To Read",
  in_progress: "In Progress",
  finished: "Finished",
};

export const STATUS_FILTERS: Array<{ label: string; value: BookStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "To Read", value: "to_read" },
  { label: "In Progress", value: "in_progress" },
  { label: "Finished", value: "finished" },
];

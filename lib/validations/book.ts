import { z } from "zod";

export const bookStatusEnum = z.enum(["to_read", "in_progress", "finished"]);

export const bookFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    author: z.string().trim().min(1, "Author name is required").max(200),
    total_pages: z.coerce
      .number({ invalid_type_error: "Total pages must be a number" })
      .int("Total pages must be a whole number")
      .positive("Total pages must be greater than 0"),
    current_page: z.coerce
      .number({ invalid_type_error: "Current page must be a number" })
      .int("Current page must be a whole number")
      .min(0, "Current page can't be negative")
      .default(0),
    genre: z.string().trim().max(100).optional().or(z.literal("")),
    target_finish_date: z.string().optional().or(z.literal("")),
    status: bookStatusEnum.default("to_read"),
    rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  })
  .refine((data) => data.current_page <= data.total_pages, {
    message: "Current page can't exceed total pages",
    path: ["current_page"],
  })
  .refine((data) => data.status !== "finished" || !!data.rating, {
    message: "Please give a 1-5 star rating when marking a book finished",
    path: ["rating"],
  });

export type BookFormValues = z.infer<typeof bookFormSchema>;

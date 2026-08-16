"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { bookFormSchema, type BookFormValues } from "@/lib/validations/book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Book } from "@/lib/types";

interface BookFormProps {
  defaultValues?: Partial<Book>;
  onSubmit: (values: BookFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

export function BookForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: BookFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      author: defaultValues?.author ?? "",
      total_pages: defaultValues?.total_pages ?? undefined,
      current_page: defaultValues?.current_page ?? 0,
      genre: defaultValues?.genre ?? "",
      target_finish_date: defaultValues?.target_finish_date ?? "",
      status: defaultValues?.status ?? "to_read",
      rating: defaultValues?.rating ?? undefined,
    },
  });

  const status = watch("status");
  const rating = watch("rating");

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="The Hobbit" {...register("title")} />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="author">Author</Label>
        <Input id="author" placeholder="J.R.R. Tolkien" {...register("author")} />
        {errors.author && (
          <p className="text-xs text-destructive">{errors.author.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="total_pages">Total pages</Label>
          <Input
            id="total_pages"
            type="number"
            min={1}
            placeholder="310"
            {...register("total_pages")}
          />
          {errors.total_pages && (
            <p className="text-xs text-destructive">{errors.total_pages.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="current_page">Current page</Label>
          <Input
            id="current_page"
            type="number"
            min={0}
            placeholder="0"
            {...register("current_page")}
          />
          {errors.current_page && (
            <p className="text-xs text-destructive">{errors.current_page.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="genre">Genre</Label>
        <Input id="genre" placeholder="Fantasy" {...register("genre")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="target_finish_date">Target finish date</Label>
          <Input
            id="target_finish_date"
            type="date"
            {...register("target_finish_date")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setValue("status", v as BookFormValues["status"])}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="to_read">To Read</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {status === "finished" && (
        <div className="flex flex-col gap-1.5">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("rating", value, { shouldValidate: true })}
                  aria-label={`${value} star`}
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      (rating ?? 0) >= value
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    )}
                  />
                </button>
              );
            })}
          </div>
          {errors.rating && (
            <p className="text-xs text-destructive">{errors.rating.message}</p>
          )}
        </div>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save book"}
        </Button>
      </div>
    </form>
  );
}

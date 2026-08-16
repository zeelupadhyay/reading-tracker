"use client";

import { Button } from "@/components/ui/button";
import { STATUS_FILTERS, type BookStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  value: BookStatus | "all";
  onChange: (value: BookStatus | "all") => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
      {STATUS_FILTERS.map((f) => (
        <Button
          key={f.value}
          size="sm"
          variant={value === f.value ? "default" : "outline"}
          onClick={() => onChange(f.value)}
          className={cn(value === f.value && "shadow-sm")}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}

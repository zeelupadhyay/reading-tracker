import { BookOpen, CheckCircle2, Clock, ListTodo } from "lucide-react";

interface SummaryBannerProps {
  total: number;
  finished: number;
  inProgress: number;
  toRead: number;
  completionRate: number;
}

export function SummaryBanner({
  total,
  finished,
  inProgress,
  toRead,
  completionRate,
}: SummaryBannerProps) {
  const stats = [
    { label: "Total Books", value: total, icon: BookOpen },
    { label: "To Read", value: toRead, icon: ListTodo },
    { label: "In Progress", value: inProgress, icon: Clock },
    { label: "Finished", value: finished, icon: CheckCircle2 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Reading Completion Rate</p>
          <p className="text-3xl font-bold">{completionRate}%</p>
        </div>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted sm:w-64">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
          >
            <Icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-semibold leading-none">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

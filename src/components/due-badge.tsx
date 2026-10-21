import { describeDueDate } from "@/lib/format";
import { DUE_BADGE_CLASS } from "@/lib/due";
import { cn } from "@/lib/utils";

export function DueBadge({
  dueAt,
  now = new Date(),
  completed = false,
  className,
}: {
  dueAt: Date | string | null | undefined;
  now?: Date;
  completed?: boolean;
  className?: string;
}) {
  if (completed) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
          "bg-secondary text-muted-foreground ring-border",
          className,
        )}
      >
        Completed
      </span>
    );
  }

  const due = describeDueDate(dueAt, now);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        DUE_BADGE_CLASS[due.tone],
        className,
      )}
    >
      {due.label}
    </span>
  );
}

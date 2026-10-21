import type { DueTone } from "@/lib/format";

export const DUE_TONE_CLASS: Record<DueTone, string> = {
  overdue: "font-medium text-rose-600 dark:text-rose-400",
  today: "font-medium text-amber-600 dark:text-amber-400",
  tomorrow: "text-muted-foreground",
  soon: "text-muted-foreground",
  later: "text-muted-foreground",
  none: "text-muted-foreground",
};

export const DUE_BADGE_CLASS: Record<DueTone, string> = {
  overdue:
    "bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300",
  today: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  tomorrow:
    "bg-primary/10 text-primary ring-primary/20",
  soon: "bg-secondary text-muted-foreground ring-border",
  later: "bg-secondary text-muted-foreground ring-border",
  none: "bg-secondary text-muted-foreground ring-border",
};

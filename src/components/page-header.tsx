import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  meta,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        {Icon ? (
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
            <Icon className="size-5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="truncate text-[1.375rem] leading-tight font-semibold tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-3">{meta}</div> : null}
        </div>
      </div>
      {action ? (
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
          {action}
        </div>
      ) : null}
    </header>
  );
}

const TONE_STYLES = {
  neutral: "bg-primary/10 text-primary ring-primary/15",
  positive:
    "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  warning:
    "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  critical:
    "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400",
} as const;

const TONE_TEXT = {
  neutral: "text-muted-foreground",
  positive: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  critical: "text-rose-600 dark:text-rose-400",
} as const;

export type MetricTone = keyof typeof TONE_STYLES;

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  trend,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: MetricTone;
  trend?: { value: string; direction: "up" | "down" | "flat"; tone?: MetricTone };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-raised",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
            TONE_STYLES[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <p className="tabular mt-3 text-3xl leading-none font-semibold tracking-tight">
        {value}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {trend ? (
          <span
            className={cn(
              "text-xs font-medium",
              trend.direction === "flat"
                ? TONE_TEXT.neutral
                : TONE_TEXT[
                    trend.tone ??
                      (trend.direction === "up" ? "positive" : "critical")
                  ],
            )}
          >
            {trend.value}
          </span>
        ) : null}
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}

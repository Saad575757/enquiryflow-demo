import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isPast,
  isToday,
  isTomorrow,
} from "date-fns";

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "d MMM yyyy");
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "d MMM yyyy, HH:mm");
}

export function formatMonthYear(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "MMMM yyyy");
}

export function timeAgo(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return `${formatDistanceToNowStrict(date)} ago`;
}

export type DueTone = "overdue" | "today" | "tomorrow" | "soon" | "later" | "none";

export type DueDescription = {
  label: string;
  tone: DueTone;
};

export function describeDueDate(
  value: Date | string | null | undefined,
  now: Date,
): DueDescription {
  if (!value) return { label: "No date set", tone: "none" };

  const date = typeof value === "string" ? new Date(value) : value;
  const days = differenceInCalendarDays(date, now);

  if (isPast(date) && !isToday(date)) {
    const overdueBy = Math.abs(days);
    return {
      label: `${overdueBy} day${overdueBy === 1 ? "" : "s"} overdue`,
      tone: "overdue",
    };
  }

  if (isToday(date)) return { label: "Due today", tone: "today" };
  if (isTomorrow(date)) return { label: "Due tomorrow", tone: "tomorrow" };

  if (days <= 7) return { label: `Due in ${days} days`, tone: "soon" };

  return { label: `Due ${format(date, "d MMM")}`, tone: "later" };
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

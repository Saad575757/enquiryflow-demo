import { cn } from "@/lib/utils";

const AVATAR_TONES = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
];

function toneFor(name: string) {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 100_000;
  }

  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  className,
  size = "default",
}: {
  name: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <span
      aria-hidden
      title={name}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-black/5 dark:ring-white/10",
        toneFor(name),
        size === "sm" && "size-6 text-[10px]",
        size === "default" && "size-8 text-xs",
        size === "lg" && "size-11 text-sm",
        className,
      )}
    >
      {initialsFor(name)}
    </span>
  );
}

import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[0.625rem] bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="size-[62%]"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6.5h10.5" />
        <path d="M4 12h7.5" />
        <path d="M4 17.5h5" />
        <path d="m14 15.5 2.2 2.2 4.3-4.6" />
      </svg>
    </span>
  );
}

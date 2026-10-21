import type * as React from "react";

import { cn } from "@/lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      data-slot="separator"
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

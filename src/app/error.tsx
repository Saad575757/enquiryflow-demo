"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message =
    error instanceof Error && error.message
      ? error.message
      : "An unexpected error interrupted this page.";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </span>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => retry()}>
          <RotateCcw className="size-4" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

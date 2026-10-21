"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { InlineScript } from "@/components/inline-script";

import "./globals.css";

const themeScript = `(function(){try{var t=localStorage.getItem('enquiryflow-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <InlineScript html={themeScript} />
        <title>Something went wrong · EnquiryFlow</title>
      </head>
      <body className="min-h-full bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <TriangleAlert className="size-6" />
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            EnquiryFlow hit a problem
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The application failed to load. Reloading usually fixes it.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-9.5 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RotateCcw className="size-4" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-9.5 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

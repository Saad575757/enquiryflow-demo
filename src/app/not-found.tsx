import { ArrowLeft, FileQuestion, LayoutDashboard, ListChecks } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FileQuestion className="size-6" />
      </span>

      <p className="tabular mt-6 text-sm font-semibold tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        The enquiry may have been deleted, or the link you followed is no
        longer valid.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">
            <LayoutDashboard className="size-4" />
            Go to dashboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/enquiries">
            <ListChecks className="size-4" />
            Browse enquiries
          </Link>
        </Button>
      </div>

      <Link
        href="/enquiries"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to safety
      </Link>
    </div>
  );
}

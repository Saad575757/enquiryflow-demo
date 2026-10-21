"use client";

import { ChevronRight, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { routeLabel } from "@/lib/nav";

const DEMO_USER = {
  name: "Alex Rowe",
  role: "Advisory lead",
};

function Breadcrumb() {
  const pathname = usePathname();

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        <li className="text-muted-foreground">Workspace</li>
        <li aria-hidden className="text-muted-foreground/50">
          <ChevronRight className="size-3.5" />
        </li>
        <li className="truncate font-medium text-foreground">
          {routeLabel(pathname)}
        </li>
      </ol>
    </nav>
  );
}

export function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();

    router.push(trimmed ? `/enquiries?q=${encodeURIComponent(trimmed)}` : "/enquiries");
  }

  return (
    <header className="sticky top-0 z-20 hidden h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md lg:flex xl:px-10">
      <Suspense
        fallback={<div aria-hidden className="h-4 w-28 animate-pulse rounded bg-muted" />}
      >
        <Breadcrumb />
      </Suspense>

      <div className="ml-auto flex items-center gap-3">
        <form role="search" onSubmit={handleSubmit} className="relative hidden md:block">
          <label htmlFor="global-search" className="sr-only">
            Search enquiries
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search enquiries…"
            className="h-9 w-64 rounded-lg border border-input bg-card pl-9 pr-3 text-sm shadow-xs transition-[color,box-shadow,border-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 xl:w-72"
          />
        </form>

        <ThemeToggle />

        <div className="flex items-center gap-2.5 border-l border-border pl-3">
          <Avatar name={DEMO_USER.name} />
          <div className="hidden leading-tight xl:block">
            <p className="text-sm font-medium">{DEMO_USER.name}</p>
            <p className="text-xs text-muted-foreground">{DEMO_USER.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

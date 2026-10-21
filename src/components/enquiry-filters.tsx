"use client";

import { AlertTriangle, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ENQUIRY_STATUS_VALUES,
  ENQUIRY_TYPE_VALUES,
  STATUS_META,
  TYPE_META,
} from "@/lib/enquiry";
import { cn } from "@/lib/utils";

type TeamMemberOption = {
  id: string;
  name: string;
};

const ALL = "__all__";

export function EnquiryFilters({
  teamMembers,
}: {
  teamMembers: TeamMemberOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";

  const [draft, setDraft] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const [pushedQuery, setPushedQuery] = useState<string | null>(null);

  // Adjust the input when the URL query changes for a reason other than the
  // debounced search below (for example the top bar search or the back
  // button). React's "adjust state while rendering" pattern.
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);

    if (pushedQuery !== urlQuery) {
      setDraft(urlQuery);
    }

    setPushedQuery(null);
  }

  function apply(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === ALL) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const queryString = params.toString();

    startTransition(() => {
      router.replace(queryString ? `/enquiries?${queryString}` : "/enquiries");
    });
  }

  // Search as you type, but not on every keystroke.
  useEffect(() => {
    if (draft === urlQuery) return;

    const timeout = setTimeout(() => {
      const next = draft.trim();

      setPushedQuery(next);
      apply({ q: next || null });
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, urlQuery]);

  const hasFilters =
    searchParams.has("q") ||
    searchParams.has("status") ||
    searchParams.has("type") ||
    searchParams.has("owner") ||
    searchParams.has("overdue");

  const overdueActive = searchParams.get("overdue") === "1";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search title, contact, organisation or email…"
            aria-label="Search enquiries"
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
          <Select
            value={searchParams.get("status") ?? ALL}
            onValueChange={(value) => apply({ status: value })}
          >
            <SelectTrigger className="lg:w-48" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {ENQUIRY_STATUS_VALUES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("type") ?? ALL}
            onValueChange={(value) => apply({ type: value })}
          >
            <SelectTrigger className="lg:w-44" aria-label="Filter by type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {ENQUIRY_TYPE_VALUES.map((type) => (
                <SelectItem key={type} value={type}>
                  {TYPE_META[type].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("owner") ?? ALL}
            onValueChange={(value) => apply({ owner: value })}
          >
            <SelectTrigger className="lg:w-48" aria-label="Filter by owner">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All owners</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <button
          type="button"
          aria-pressed={overdueActive}
          onClick={() => apply({ overdue: overdueActive ? null : "1" })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors",
            overdueActive
              ? "bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300"
              : "bg-muted text-muted-foreground ring-border hover:text-foreground",
          )}
        >
          <AlertTriangle className="size-3.5" />
          Overdue actions only
        </button>

        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="text-xs text-muted-foreground">Updating…</span>
          ) : null}
          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft("");
                startTransition(() => router.replace("/enquiries"));
              }}
            >
              <X className="size-4" />
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

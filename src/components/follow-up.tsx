"use client";

import { Check, Circle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addFollowUpAction, toggleFollowUpAction } from "@/actions/enquiries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type FollowUp = {
  id: string;
  action: string;
  dueAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
};

export function FollowUpHistory({
  followUps,
}: {
  followUps: FollowUp[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle(followUpId: string, completed: boolean) {
    startTransition(async () => {
      const result = await toggleFollowUpAction(followUpId, completed);

      if (!result.ok) {
        toast.error(result.message ?? "The action could not be updated.");
        return;
      }

      toast.success(completed ? "Action completed." : "Action reopened.");
      router.refresh();
    });
  }

  if (followUps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No follow-up actions logged yet. Add the first one below.
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {followUps.map((followUp, index) => {
        const completed = followUp.completedAt !== null;
        const isLast = index === followUps.length - 1;

        return (
          <li key={followUp.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            <div className="relative flex flex-col items-center">
              <button
                type="button"
                disabled={isPending}
                onClick={() => toggle(followUp.id, !completed)}
                aria-label={`Mark "${followUp.action}" as ${
                  completed ? "outstanding" : "completed"
                }`}
                className={cn(
                  "z-10 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  completed
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {completed ? (
                  <Check className="size-3.5" />
                ) : (
                  <Circle className="size-2.5 fill-current" />
                )}
              </button>
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute top-6 bottom-[-1.25rem] w-px bg-border"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  completed && "text-muted-foreground line-through",
                )}
              >
                {followUp.action}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {completed
                  ? `Completed ${formatDate(followUp.completedAt)}`
                  : followUp.dueAt
                    ? `Due ${formatDate(followUp.dueAt)}`
                    : "No due date"}
                <span className="mx-1.5 text-border">·</span>
                Logged {formatDate(followUp.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function AddFollowUpForm({ enquiryId }: { enquiryId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState("");
  const [dueAt, setDueAt] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await addFollowUpAction({ enquiryId, action, dueAt });

      if (!result.ok) {
        toast.error(result.message ?? "The action could not be saved.");
        return;
      }

      setAction("");
      setDueAt("");
      toast.success("Follow-up added.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="followUpAction">Action</Label>
          <Input
            id="followUpAction"
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="Chase the finance lead for approval"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="followUpDueAt">Due date</Label>
          <Input
            id="followUpDueAt"
            type="date"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />
        </div>
        <Button type="submit" size="default" disabled={isPending}>
          <Plus className="size-4" />
          {isPending ? "Adding…" : "Add"}
        </Button>
      </div>
    </form>
  );
}

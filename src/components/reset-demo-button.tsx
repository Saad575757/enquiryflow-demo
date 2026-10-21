"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { resetDemoData } from "@/actions/enquiries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ResetDemoButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    startTransition(async () => {
      const result = await resetDemoData();

      if (result.ok) {
        toast.success("Demo data has been reset.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message ?? "Could not reset the demo data.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
          <RotateCcw className="size-4" />
          Reset demo data
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset demo data?</DialogTitle>
          <DialogDescription>
            This deletes every demo enquiry and follow-up, then reloads the
            original sample set. Enquiries you created yourself are not
            affected.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleReset} disabled={isPending}>
            {isPending ? "Resetting…" : "Reset demo data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

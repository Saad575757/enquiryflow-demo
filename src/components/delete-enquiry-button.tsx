"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteEnquiry } from "@/actions/enquiries";
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

export function DeleteEnquiryButton({
  enquiryId,
  enquiryTitle,
  className,
}: {
  enquiryId: string;
  enquiryTitle: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEnquiry(enquiryId);

      if (!result.ok) {
        toast.error(result.message ?? "The enquiry could not be deleted.");
        return;
      }

      setOpen(false);
      toast.success("Enquiry deleted.");
      router.push("/enquiries");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-destructive hover:bg-destructive/10 ${className ?? ""}`}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this enquiry?</DialogTitle>
          <DialogDescription>
            “{enquiryTitle}” and its follow-up history will be permanently
            removed. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete enquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

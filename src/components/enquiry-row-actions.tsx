"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";

export function EnquiryRowActions({
  enquiryId,
  enquiryTitle,
  layout = "icon",
  className,
}: {
  enquiryId: string;
  enquiryTitle: string;
  layout?: "icon" | "labelled";
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isIcon = layout === "icon";

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
    <div className={cn("flex items-center gap-1.5", className)}>
      {isIcon ? (
        <>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            title="View enquiry"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href={`/enquiries/${enquiryId}`} aria-label={`View ${enquiryTitle}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            title="Edit enquiry"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link
              href={`/enquiries/${enquiryId}/edit`}
              aria-label={`Edit ${enquiryTitle}`}
            >
              <Pencil className="size-4" />
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild size="sm" className="flex-1 sm:flex-none">
            <Link href={`/enquiries/${enquiryId}`}>
              <Eye className="size-4" />
              View
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Link href={`/enquiries/${enquiryId}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size={isIcon ? "icon-sm" : "sm"}
            title="Delete enquiry"
            className={cn(
              "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
              !isIcon && "flex-1 text-destructive hover:text-destructive sm:flex-none",
            )}
          >
            <Trash2 className="size-4" />
            {isIcon ? null : "Delete"}
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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete enquiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateInternalNotes } from "@/actions/enquiries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function InternalNotesEditor({
  enquiryId,
  initialNotes,
}: {
  enquiryId: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isEditing, setIsEditing] = useState(false);

  function handleSave() {
    startTransition(async () => {
      const result = await updateInternalNotes(enquiryId, notes);

      if (!result.ok) {
        toast.error(result.message ?? "The notes could not be saved.");
        return;
      }

      setIsEditing(false);
      toast.success("Notes saved.");
      router.refresh();
    });
  }

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {notes || "No internal notes yet."}
        </p>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          {notes ? "Edit notes" : "Add notes"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Textarea
        rows={6}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Context that the customer should never see…"
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save notes"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setNotes(initialNotes ?? "");
            setIsEditing(false);
          }}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

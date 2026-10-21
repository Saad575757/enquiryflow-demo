"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEnquiryStatus } from "@/actions/enquiries";
import { StatusBadge } from "@/components/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENQUIRY_STATUS_VALUES, STATUS_META } from "@/lib/enquiry";
import type { EnquiryStatus } from "@/generated/prisma/enums";

export function EnquiryStatusControl({
  enquiryId,
  status,
}: {
  enquiryId: string;
  status: EnquiryStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(status);

  function handleChange(value: string) {
    const previous = current;
    setCurrent(value as EnquiryStatus);

    startTransition(async () => {
      const result = await updateEnquiryStatus(enquiryId, value);

      if (!result.ok) {
        setCurrent(previous);
        toast.error(result.message ?? "The status could not be updated.");
        return;
      }

      toast.success(`Moved to ${STATUS_META[value as EnquiryStatus].label}.`);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <StatusBadge status={current} />
      <Select value={current} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-52" aria-label="Update status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ENQUIRY_STATUS_VALUES.map((value) => (
            <SelectItem key={value} value={value}>
              {STATUS_META[value].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

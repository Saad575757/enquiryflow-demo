"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEnquiryOwner } from "@/actions/enquiries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TeamMemberOption = {
  id: string;
  name: string;
};

const UNASSIGNED = "__unassigned__";

export function EnquiryOwnerControl({
  enquiryId,
  ownerId,
  teamMembers,
}: {
  enquiryId: string;
  ownerId: string | null;
  teamMembers: TeamMemberOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(ownerId ?? UNASSIGNED);

  function handleChange(value: string) {
    const previous = current;
    setCurrent(value);

    startTransition(async () => {
      const result = await updateEnquiryOwner(
        enquiryId,
        value === UNASSIGNED ? undefined : value,
      );

      if (!result.ok) {
        setCurrent(previous);
        toast.error(result.message ?? "The owner could not be updated.");
        return;
      }

      toast.success("Owner updated.");
      router.refresh();
    });
  }

  return (
    <Select
      value={current}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-56" aria-label="Assign owner">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {teamMembers.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

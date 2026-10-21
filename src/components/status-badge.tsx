import type { EnquiryStatus } from "@/generated/prisma/enums";
import { STATUS_META } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: EnquiryStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        meta.badgeClass,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </span>
  );
}

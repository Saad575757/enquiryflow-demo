import type { EnquiryStatus } from "@/generated/prisma/enums";
import { STATUS_META } from "@/lib/enquiry";

export function PipelineBreakdown({
  data,
}: {
  data: { status: EnquiryStatus; count: number }[];
}) {
  const total = data.reduce((sum, row) => sum + row.count, 0);
  const visible = data.filter((row) => row.count > 0);

  return (
    <div className="space-y-5">
      <div
        className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${total} enquiries across ${visible.length} pipeline stages`}
      >
        {total === 0 ? null : (
          visible.map((row) => (
            <span
              key={row.status}
              className={`${STATUS_META[row.status].dotClass} first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${(row.count / total) * 100}%` }}
            />
          ))
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No enquiries in the pipeline yet.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {data.map((row) => {
            const share = total === 0 ? 0 : Math.round((row.count / total) * 100);

            return (
              <li key={row.status}>
                <div className="flex items-center gap-2.5 text-sm">
                  <span
                    aria-hidden
                    className={`size-2 shrink-0 rounded-full ${STATUS_META[row.status].dotClass}`}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {STATUS_META[row.status].label}
                  </span>
                  <span className="tabular font-medium">{row.count}</span>
                  <span className="tabular w-9 text-right text-xs text-muted-foreground">
                    {share}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { ChevronRight, Inbox } from "lucide-react";
import Link from "next/link";

import { DueBadge } from "@/components/due-badge";
import { EnquiryRowActions } from "@/components/enquiry-row-actions";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TYPE_META } from "@/lib/enquiry";
import { formatDate } from "@/lib/format";
import type { EnquiryWithOwner } from "@/lib/queries";

export function EnquiryTable({
  enquiries,
  now,
}: {
  enquiries: EnquiryWithOwner[];
  now: Date;
}) {
  if (enquiries.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No enquiries match these filters"
        description="Try clearing a filter, or capture a new enquiry to get started."
        action={
          <Button asChild>
            <Link href="/enquiries/new">New enquiry</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-card lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[32%]">Enquiry</TableHead>
              <TableHead className="hidden xl:table-cell">Type</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[22%]">Next action</TableHead>
              <TableHead className="hidden 2xl:table-cell">Received</TableHead>
              <TableHead className="w-[1%] text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries.map((enquiry) => {
              const completed = enquiry.nextActionCompletedAt !== null;

              return (
                <TableRow key={enquiry.id} className="group">
                  <TableCell className="min-w-52">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/enquiries/${enquiry.id}`}
                        className="min-w-0 truncate font-medium underline-offset-4 group-hover:underline"
                      >
                        {enquiry.title}
                      </Link>
                      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {enquiry.contactName}
                      {enquiry.organisation ? ` · ${enquiry.organisation}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground 2xl:hidden">
                      Received {formatDate(enquiry.dateReceived)}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                    {TYPE_META[enquiry.enquiryType].label}
                  </TableCell>
                  <TableCell>
                    {enquiry.assignedOwner ? (
                      <span className="flex items-center gap-2">
                        <Avatar name={enquiry.assignedOwner.name} size="sm" />
                        <span className="text-sm whitespace-nowrap">
                          {enquiry.assignedOwner.name}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={enquiry.status} />
                  </TableCell>
                  <TableCell>
                    {enquiry.nextAction ? (
                      <>
                        <p
                          className={
                            completed
                              ? "truncate text-sm text-muted-foreground line-through"
                              : "truncate text-sm"
                          }
                        >
                          {enquiry.nextAction}
                        </p>
                        <div className="mt-1">
                          <DueBadge
                            dueAt={enquiry.nextActionDueAt}
                            now={now}
                            completed={completed}
                          />
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground 2xl:table-cell">
                    {formatDate(enquiry.dateReceived)}
                  </TableCell>
                  <TableCell className="text-right">
                    <EnquiryRowActions
                      enquiryId={enquiry.id}
                      enquiryTitle={enquiry.title}
                      className="justify-end"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile / tablet cards */}
      <ul className="space-y-3 lg:hidden">
        {enquiries.map((enquiry) => {
          const completed = enquiry.nextActionCompletedAt !== null;

          return (
            <li key={enquiry.id}>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-raised">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/enquiries/${enquiry.id}`}
                      className="block font-medium leading-snug underline-offset-4 hover:underline"
                    >
                      {enquiry.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {enquiry.contactName}
                      {enquiry.organisation ? ` · ${enquiry.organisation}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={enquiry.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    {TYPE_META[enquiry.enquiryType].label}
                  </span>
                  {enquiry.assignedOwner ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar name={enquiry.assignedOwner.name} size="sm" />
                      {enquiry.assignedOwner.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                  <span className="ml-auto text-muted-foreground">
                    {formatDate(enquiry.dateReceived)}
                  </span>
                </div>

                {enquiry.nextAction ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <p
                      className={
                        completed
                          ? "truncate text-sm text-muted-foreground line-through"
                          : "truncate text-sm"
                      }
                    >
                      {enquiry.nextAction}
                    </p>
                    <div className="mt-1.5">
                      <DueBadge
                        dueAt={enquiry.nextActionDueAt}
                        now={now}
                        completed={completed}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <EnquiryRowActions
                    enquiryId={enquiry.id}
                    enquiryTitle={enquiry.title}
                    layout="labelled"
                    className="w-full"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

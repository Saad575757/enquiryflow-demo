import { Inbox } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { EnquiryFilters } from "@/components/enquiry-filters";
import { EnquiryTable } from "@/components/enquiry-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/separator";
import { listEnquiries, listTeamMembers } from "@/lib/queries";
import { enquiryListSchema, type EnquiryListFilters } from "@/lib/validation";

export const metadata = {
  title: "Enquiries",
};

type EnquiriesSearchParams = PageProps<"/enquiries">["searchParams"];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function EnquiryResults({ filters }: { filters: EnquiryListFilters }) {
  await connection();

  const enquiries = await listEnquiries(filters);
  const now = new Date();

  const unassigned = enquiries.filter(
    (enquiry) => enquiry.assignedOwnerId === null,
  ).length;
  const unownedNextAction = enquiries.filter(
    (enquiry) =>
      enquiry.nextAction && enquiry.nextActionCompletedAt === null,
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <p>
          <span className="tabular font-medium text-foreground">
            {enquiries.length}
          </span>{" "}
          {enquiries.length === 1 ? "enquiry" : "enquiries"}
          {filters.overdue ? " with overdue actions" : ""}
        </p>
        {unassigned > 0 ? (
          <p>
            <span className="tabular font-medium text-foreground">
              {unassigned}
            </span>{" "}
            unassigned
          </p>
        ) : null}
        {unownedNextAction > 0 ? (
          <p>
            <span className="tabular font-medium text-foreground">
              {unownedNextAction}
            </span>{" "}
            awaiting a next action
          </p>
        ) : null}
      </div>

      <EnquiryTable enquiries={enquiries} now={now} />
    </div>
  );
}

async function EnquiriesContent({
  searchParams,
}: {
  searchParams: EnquiriesSearchParams;
}) {
  const params = await searchParams;

  const parsed = enquiryListSchema.safeParse({
    q: first(params.q),
    status: first(params.status),
    type: first(params.type),
    owner: first(params.owner),
    overdue: first(params.overdue),
  });

  const filters: EnquiryListFilters = parsed.success ? parsed.data : {};
  const teamMembers = await listTeamMembers();

  return (
    <div className="space-y-6">
      <EnquiryFilters
        teamMembers={teamMembers.map((member) => ({
          id: member.id,
          name: member.name,
        }))}
      />
      <EnquiryResults filters={filters} />
    </div>
  );
}

export default function EnquiriesPage({
  searchParams,
}: PageProps<"/enquiries">) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description="Every enquiry in the pipeline, with the owner and next action."
        icon={Inbox}
        action={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/enquiries/new">New enquiry</Link>
          </Button>
        }
      />

      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        }
      >
        <EnquiriesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

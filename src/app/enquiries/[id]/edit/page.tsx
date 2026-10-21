import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { format } from "date-fns";

import { EnquiryForm } from "@/components/enquiry-form";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/separator";
import { getEnquiryDetail, listTeamMembers } from "@/lib/queries";

export async function generateMetadata({
  params,
}: PageProps<"/enquiries/[id]/edit">) {
  const { id } = await params;
  const enquiry = await getEnquiryDetail(id);

  return {
    title: enquiry ? `Edit ${enquiry.title}` : "Edit enquiry",
  };
}

async function EditEnquiryContent({
  params,
}: {
  params: PageProps<"/enquiries/[id]/edit">["params"];
}) {
  await connection();

  const { id } = await params;

  const [enquiry, teamMembers] = await Promise.all([
    getEnquiryDetail(id),
    listTeamMembers(),
  ]);

  if (!enquiry) {
    notFound();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Edit enquiry" description={enquiry.title} icon={Pencil} />

      <EnquiryForm
        enquiryId={enquiry.id}
        today={today}
        teamMembers={teamMembers.map((member) => ({
          id: member.id,
          name: member.name,
        }))}
        defaultValues={{
          title: enquiry.title,
          contactName: enquiry.contactName,
          email: enquiry.email ?? "",
          phone: enquiry.phone ?? "",
          organisation: enquiry.organisation ?? "",
          enquiryType: enquiry.enquiryType,
          source: enquiry.source ?? undefined,
          description: enquiry.description ?? "",
          dateReceived: format(enquiry.dateReceived, "yyyy-MM-dd"),
          assignedOwnerId: enquiry.assignedOwnerId ?? "",
          nextAction: enquiry.nextAction ?? "",
          nextActionDueAt: enquiry.nextActionDueAt
            ? format(enquiry.nextActionDueAt, "yyyy-MM-dd")
            : "",
        }}
      />
    </div>
  );
}

export default function EditEnquiryPage({
  params,
}: PageProps<"/enquiries/[id]/edit">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-16 w-full max-w-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <EditEnquiryContent params={params} />
    </Suspense>
  );
}

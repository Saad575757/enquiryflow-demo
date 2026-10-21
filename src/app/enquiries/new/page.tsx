import { FilePlus2 } from "lucide-react";
import { Suspense } from "react";
import { connection } from "next/server";

import { EnquiryForm } from "@/components/enquiry-form";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/separator";
import { listTeamMembers } from "@/lib/queries";

export const metadata = {
  title: "New enquiry",
};

async function NewEnquiryContent() {
  await connection();

  const teamMembers = await listTeamMembers();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <EnquiryForm
      today={today}
      teamMembers={teamMembers.map((member) => ({
        id: member.id,
        name: member.name,
      }))}
    />
  );
}

export default function NewEnquiryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New enquiry"
        description="Capture an enquiry, assign an owner and set the next action."
        icon={FilePlus2}
      />

      <Suspense fallback={<Skeleton className="h-[32rem] rounded-xl" />}>
        <NewEnquiryContent />
      </Suspense>
    </div>
  );
}

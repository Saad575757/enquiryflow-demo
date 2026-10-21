import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Everything the team owes the pipeline today."
        icon={LayoutDashboard}
        action={
          <Button asChild>
            <Link href="/enquiries/new">New enquiry</Link>
          </Button>
        }
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

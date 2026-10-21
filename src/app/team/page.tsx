import { ArrowUpRight, Briefcase, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { PageHeader } from "@/components/page-header";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { listTeamWorkload } from "@/lib/queries";

export const metadata = {
  title: "Team",
};

async function TeamContent() {
  await connection();

  const team = await listTeamWorkload();
  const busiest = Math.max(1, ...team.map((entry) => entry.openCount));
  const totalOpen = team.reduce((sum, entry) => sum + entry.openCount, 0);
  const totalEnquiries = team.reduce((sum, entry) => sum + entry.totalCount, 0);

  const sorted = [...team].sort(
    (a, b) => b.openCount - a.openCount || a.member.name.localeCompare(b.member.name),
  );

  if (team.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No team members yet"
        description="Add a team member to start assigning enquiries and tracking workload."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile label="Team members" value={team.length} />
        <SummaryTile label="Open enquiries" value={totalOpen} />
        <SummaryTile label="Enquiries handled" value={totalEnquiries} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map(({ member, openCount, totalCount, lastEnquiryAt }) => (
          <Card
            key={member.id}
            className="group transition-shadow hover:shadow-raised"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar name={member.name} size="lg" />
                <div className="min-w-0">
                  <CardTitle className="truncate">{member.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5" />
                    {member.department ?? "No department set"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Open</dt>
                  <dd className="tabular mt-0.5 text-lg font-semibold">
                    {openCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Total</dt>
                  <dd className="tabular mt-0.5 text-lg font-semibold">
                    {totalCount}
                  </dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-xs text-muted-foreground">Most recent</dt>
                  <dd className="mt-0.5 text-sm font-medium">
                    {lastEnquiryAt ? formatDate(lastEnquiryAt) : "—"}
                  </dd>
                </div>
              </dl>

              <Progress
                value={(openCount / busiest) * 100}
                label={`${openCount} open enquiries for ${member.name}`}
              />

              <Link
                href={`/enquiries?owner=${member.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                View their enquiries
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="tabular mt-2 text-3xl leading-none font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Who owns what, and where the workload is sitting."
        icon={Users}
      />

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-xl" />
            ))}
          </div>
        }
      >
        <TeamContent />
      </Suspense>
    </div>
  );
}

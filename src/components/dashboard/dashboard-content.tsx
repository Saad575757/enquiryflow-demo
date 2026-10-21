import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  Inbox,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { DueBadge } from "@/components/due-badge";
import { PipelineBreakdown } from "@/components/dashboard/pipeline-breakdown";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { MetricCard } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { getDashboardData } from "@/lib/queries";

export async function DashboardContent() {
  await connection();

  const data = await getDashboardData();
  const now = new Date();

  const openShare =
    data.totals.total === 0
      ? 0
      : Math.round((data.totals.open / data.totals.total) * 100);
  const busiest = Math.max(
    1,
    ...data.teamLoad.map((entry) => entry.openCount),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Open enquiries"
          value={data.totals.open}
          hint={`${openShare}% of the pipeline`}
          icon={Inbox}
        />
        <MetricCard
          label="New this week"
          value={data.totals.newThisWeek}
          hint="Received in the last 7 days"
          icon={Sparkles}
          tone="positive"
        />
        <MetricCard
          label="Overdue actions"
          value={data.totals.overdue}
          hint={
            data.totals.dueToday > 0
              ? `${data.totals.dueToday} more due today`
              : "Nothing else due today"
          }
          icon={AlertTriangle}
          tone={data.totals.overdue > 0 ? "critical" : "neutral"}
        />
        <MetricCard
          label="Conversion rate"
          value={`${data.totals.conversionRate}%`}
          hint={`${data.totals.converted} of ${data.totals.total} converted`}
          icon={TrendingUp}
          tone="positive"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div className="flex flex-col gap-1">
              <CardTitle>Enquiry volume</CardTitle>
              <CardDescription>
                Enquiries received each week over the last eight weeks.
              </CardDescription>
            </div>
            <span className="tabular hidden shrink-0 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
              {data.totals.newThisWeek} this week
            </span>
          </CardHeader>
          <CardContent>
            <VolumeChart data={data.weeklyVolume} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Pipeline by status</CardTitle>
            <CardDescription>Where every enquiry currently sits.</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineBreakdown data={data.statusBreakdown} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div className="flex flex-col gap-1">
              <CardTitle>Follow-ups due</CardTitle>
              <CardDescription>
                Outstanding actions across the pipeline, soonest first.
              </CardDescription>
            </div>
            <Link
              href="/enquiries"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View all
              <ArrowUpRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 sm:px-0">
            {data.upcomingActions.length === 0 ? (
              <div className="px-5">
                <EmptyState
                  icon={CalendarClock}
                  title="Nothing outstanding"
                  description="Every enquiry has a completed next action. New work will appear here as it arrives."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enquiry</TableHead>
                    <TableHead className="hidden sm:table-cell">Owner</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.upcomingActions.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="min-w-56">
                        <Link
                          href={`/enquiries/${enquiry.id}`}
                          className="font-medium hover:underline"
                        >
                          {enquiry.title}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {enquiry.nextAction}
                        </p>
                        {enquiry.assignedOwner ? (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:hidden">
                            <Avatar name={enquiry.assignedOwner.name} size="sm" />
                            {enquiry.assignedOwner.name}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                            Unassigned
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        {enquiry.assignedOwner ? (
                          <span className="flex items-center gap-2">
                            <Avatar
                              name={enquiry.assignedOwner.name}
                              size="sm"
                            />
                            <span className="whitespace-nowrap">
                              {enquiry.assignedOwner.name}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusBadge status={enquiry.status} />
                      </TableCell>
                      <TableCell>
                        <DueBadge dueAt={enquiry.nextActionDueAt} now={now} />
                        <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                          {formatDate(enquiry.nextActionDueAt)}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Team workload</CardTitle>
            <CardDescription>Open enquiries per team member.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.teamLoad.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No team members yet.
              </p>
            ) : (
              data.teamLoad.map(({ member, openCount, overdueCount }) => (
                <div key={member.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={member.name} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {member.name}
                        </span>
                        {member.department ? (
                          <span className="block truncate text-xs text-muted-foreground">
                            {member.department}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-sm">
                      <span className="tabular font-medium">{openCount}</span>
                      <span className="text-muted-foreground"> open</span>
                      {overdueCount > 0 ? (
                        <span className="block text-xs font-medium text-rose-600 dark:text-rose-400">
                          {overdueCount} overdue
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <Progress
                    value={(openCount / busiest) * 100}
                    label={`${openCount} open enquiries for ${member.name}`}
                    barClassName={
                      overdueCount > 0 ? "bg-rose-500" : "bg-primary"
                    }
                  />
                </div>
              ))
            )}

            {data.totals.unassigned > 0 ? (
              <Link
                href="/enquiries?owner=unassigned"
                className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-700 transition-colors hover:bg-amber-500/10 dark:text-amber-300"
              >
                <UserRound className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  {data.totals.unassigned} open{" "}
                  {data.totals.unassigned === 1 ? "enquiry has" : "enquiries have"}{" "}
                  no owner — assign one to clear the queue.
                </span>
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

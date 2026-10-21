import {
  ArrowLeft,
  Building2,
  Mail,
  Pencil,
  Phone,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

import { DeleteEnquiryButton } from "@/components/delete-enquiry-button";
import { DueBadge } from "@/components/due-badge";
import { EnquiryOwnerControl } from "@/components/enquiry-owner-control";
import { EnquiryStatusControl } from "@/components/enquiry-status-control";
import { AddFollowUpForm, FollowUpHistory } from "@/components/follow-up";
import { InternalNotesEditor } from "@/components/internal-notes-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator, Skeleton } from "@/components/ui/separator";
import { SOURCE_META, TYPE_META } from "@/lib/enquiry";
import { formatDate, formatDateTime } from "@/lib/format";
import { getEnquiryDetail, listTeamMembers } from "@/lib/queries";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/enquiries/[id]">) {
  const { id } = await params;
  const enquiry = await getEnquiryDetail(id);

  return {
    title: enquiry ? enquiry.title : "Enquiry",
  };
}

async function EnquiryDetailContent({
  params,
}: {
  params: PageProps<"/enquiries/[id]">["params"];
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

  const now = new Date();
  const completed = enquiry.nextActionCompletedAt !== null;

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Tag className="size-3" />
                {TYPE_META[enquiry.enquiryType].label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {enquiry.source
                  ? SOURCE_META[enquiry.source].label
                  : "Source unknown"}
              </span>
              <span className="text-xs text-muted-foreground">
                Received {formatDate(enquiry.dateReceived)}
              </span>
            </div>

            <h1 className="mt-3 text-2xl leading-tight font-semibold tracking-tight">
              {enquiry.title}
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              {enquiry.contactName}
              {enquiry.organisation ? ` · ${enquiry.organisation}` : ""}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <EnquiryStatusControl
                enquiryId={enquiry.id}
                status={enquiry.status}
              />
              <EnquiryOwnerControl
                enquiryId={enquiry.id}
                ownerId={enquiry.assignedOwnerId}
                teamMembers={teamMembers.map((member) => ({
                  id: member.id,
                  name: member.name,
                }))}
              />
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Link href={`/enquiries/${enquiry.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
            <DeleteEnquiryButton
              enquiryId={enquiry.id}
              enquiryTitle={enquiry.title}
              className="flex-1 sm:flex-none"
            />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>What they need</CardTitle>
              <CardDescription>
                The brief as it was received.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {enquiry.description || "No description was captured."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up history</CardTitle>
              <CardDescription>
                Every action logged against this enquiry, newest first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FollowUpHistory
                followUps={enquiry.followUpActions.map((followUp) => ({
                  id: followUp.id,
                  action: followUp.action,
                  dueAt: followUp.dueAt,
                  completedAt: followUp.completedAt,
                  createdAt: followUp.createdAt,
                }))}
              />

              <Separator />

              <AddFollowUpForm enquiryId={enquiry.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Next action</CardTitle>
              <CardDescription>What happens next on this enquiry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {enquiry.nextAction ? (
                <>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      completed && "text-muted-foreground line-through",
                    )}
                  >
                    {enquiry.nextAction}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <DueBadge
                      dueAt={enquiry.nextActionDueAt}
                      now={now}
                      completed={completed}
                    />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(enquiry.nextActionDueAt)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No next action set — add one below.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {enquiry.email ? (
                <a
                  href={`mailto:${enquiry.email}`}
                  className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate">{enquiry.email}</span>
                </a>
              ) : null}
              {enquiry.phone ? (
                <a
                  href={`tel:${enquiry.phone}`}
                  className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="size-4 shrink-0" />
                  <span>{enquiry.phone}</span>
                </a>
              ) : null}
              {enquiry.organisation ? (
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Building2 className="size-4 shrink-0" />
                  <span>{enquiry.organisation}</span>
                </div>
              ) : null}
              {!enquiry.email && !enquiry.phone && !enquiry.organisation ? (
                <p className="text-muted-foreground">
                  No contact details were captured.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">
                  {TYPE_META[enquiry.enquiryType].label}
                </span>
              </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">
                  {enquiry.source ? SOURCE_META[enquiry.source].label : "—"}
                </span>
              </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-muted-foreground">Received</span>
                <span className="font-medium">
                  {formatDate(enquiry.dateReceived)}
                </span>
              </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {formatDateTime(enquiry.createdAt)}
                </span>
              </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-medium">
                  {formatDateTime(enquiry.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal notes</CardTitle>
              <CardDescription>Only visible to your team.</CardDescription>
            </CardHeader>
            <CardContent>
              <InternalNotesEditor
                enquiryId={enquiry.id}
                initialNotes={enquiry.internalNotes}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function EnquiryDetailPage({
  params,
}: PageProps<"/enquiries/[id]">) {
  return (
    <div className="space-y-6">
      <Link
        href="/enquiries"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to enquiries
      </Link>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-16 w-full max-w-2xl" />
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-64 rounded-xl lg:col-span-2" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        }
      >
        <EnquiryDetailContent params={params} />
      </Suspense>
    </div>
  );
}

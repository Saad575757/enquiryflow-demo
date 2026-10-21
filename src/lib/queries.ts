import type {
  Enquiry,
  FollowUpAction,
  Prisma,
  TeamMember,
} from "@/generated/prisma/client";
import { EnquiryStatus } from "@/generated/prisma/enums";

import { prisma } from "@/lib/db";
import { OPEN_STATUSES, STATUS_ORDER } from "@/lib/enquiry";
import type { EnquiryListFilters } from "@/lib/validation";

export type EnquiryWithOwner = Enquiry & {
  assignedOwner: TeamMember | null;
};

export type EnquiryDetail = EnquiryWithOwner & {
  followUpActions: FollowUpAction[];
};

export type DashboardData = {
  totals: {
    total: number;
    open: number;
    newThisWeek: number;
    overdue: number;
    dueToday: number;
    converted: number;
    conversionRate: number;
    unassigned: number;
  };
  statusBreakdown: { status: EnquiryStatus; count: number }[];
  weeklyVolume: { label: string; count: number }[];
  upcomingActions: EnquiryWithOwner[];
  teamLoad: {
    member: TeamMember;
    openCount: number;
    overdueCount: number;
  }[];
};

const outstandingActionFilter = {
  nextAction: { not: null },
  nextActionDueAt: { not: null },
  nextActionCompletedAt: null,
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 7 * 7);

  const [
    total,
    open,
    newThisWeek,
    overdue,
    dueToday,
    converted,
    unassigned,
    statusGroups,
    recentEnquiries,
    upcomingActions,
    teamMembers,
    ownerGroups,
    ownerOverdueGroups,
  ] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: { in: OPEN_STATUSES } } }),
    prisma.enquiry.count({ where: { dateReceived: { gte: weekAgo } } }),
    prisma.enquiry.count({
      where: { ...outstandingActionFilter, nextActionDueAt: { lt: today } },
    }),
    prisma.enquiry.count({
      where: {
        ...outstandingActionFilter,
        nextActionDueAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.enquiry.count({ where: { status: EnquiryStatus.CONVERTED } }),
    prisma.enquiry.count({
      where: { status: { in: OPEN_STATUSES }, assignedOwnerId: null },
    }),
    prisma.enquiry.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.enquiry.findMany({
      where: { dateReceived: { gte: eightWeeksAgo } },
      select: { dateReceived: true },
    }),
    prisma.enquiry.findMany({
      where: outstandingActionFilter,
      orderBy: { nextActionDueAt: "asc" },
      take: 8,
      include: { assignedOwner: true },
    }),
    prisma.teamMember.findMany({ orderBy: { name: "asc" } }),
    prisma.enquiry.groupBy({
      by: ["assignedOwnerId"],
      where: { status: { in: OPEN_STATUSES } },
      _count: { _all: true },
    }),
    prisma.enquiry.groupBy({
      by: ["assignedOwnerId"],
      where: {
        ...outstandingActionFilter,
        nextActionDueAt: { lt: today },
      },
      _count: { _all: true },
    }),
  ]);

  const statusCounts = new Map(
    statusGroups.map((group) => [group.status, group._count._all]),
  );

  const statusBreakdown = STATUS_ORDER.map((status) => ({
    status,
    count: statusCounts.get(status) ?? 0,
  }));

  const weeklyVolume = buildWeeklyVolume(recentEnquiries, today);

  const openByOwner = new Map(
    ownerGroups.map((group) => [group.assignedOwnerId ?? "unassigned", group._count._all]),
  );
  const overdueByOwner = new Map(
    ownerOverdueGroups.map((group) => [
      group.assignedOwnerId ?? "unassigned",
      group._count._all,
    ]),
  );

  const teamLoad = teamMembers.map((member) => ({
    member,
    openCount: openByOwner.get(member.id) ?? 0,
    overdueCount: overdueByOwner.get(member.id) ?? 0,
  }));

  return {
    totals: {
      total,
      open,
      newThisWeek,
      overdue,
      dueToday,
      converted,
      conversionRate: total === 0 ? 0 : Math.round((converted / total) * 100),
      unassigned,
    },
    statusBreakdown,
    weeklyVolume,
    upcomingActions,
    teamLoad,
  };
}

function buildWeeklyVolume(enquiries: { dateReceived: Date }[], today: Date) {
  const buckets: { label: string; count: number }[] = [];

  for (let weeksAgo = 7; weeksAgo >= 0; weeksAgo -= 1) {
    const bucketStart = new Date(today);
    bucketStart.setDate(bucketStart.getDate() - weeksAgo * 7);

    buckets.push({
      label: bucketStart.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      count: 0,
    });
  }

  const weekInMs = 7 * 24 * 60 * 60 * 1000;

  for (const enquiry of enquiries) {
    const received = startOfDay(enquiry.dateReceived);
    const weeksAgo = Math.floor((today.getTime() - received.getTime()) / weekInMs);

    if (weeksAgo >= 0 && weeksAgo <= 7) {
      buckets[7 - weeksAgo].count += 1;
    }
  }

  return buckets;
}

export async function listEnquiries(
  filters: EnquiryListFilters,
): Promise<EnquiryWithOwner[]> {
  const where: Prisma.EnquiryWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.enquiryType = filters.type;
  }

  if (filters.owner) {
    where.assignedOwnerId = filters.owner === "unassigned" ? null : filters.owner;
  }

  if (filters.overdue) {
    where.nextActionDueAt = { lt: startOfDay(new Date()) };
    where.nextActionCompletedAt = null;
    where.nextAction = { not: null };
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { contactName: { contains: filters.q, mode: "insensitive" } },
      { organisation: { contains: filters.q, mode: "insensitive" } },
      { email: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.enquiry.findMany({
    where,
    orderBy: [{ dateReceived: "desc" }],
    take: 100,
    include: { assignedOwner: true },
  });
}

export async function getEnquiryDetail(id: string): Promise<EnquiryDetail | null> {
  return prisma.enquiry.findUnique({
    where: { id },
    include: {
      assignedOwner: true,
      followUpActions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  return prisma.teamMember.findMany({ orderBy: { name: "asc" } });
}

export type TeamWorkload = {
  member: TeamMember;
  openCount: number;
  totalCount: number;
  lastEnquiryAt: Date | null;
};

export async function listTeamWorkload(): Promise<TeamWorkload[]> {
  const [members, openGroups, totalGroups, enquiries] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { name: "asc" } }),
    prisma.enquiry.groupBy({
      by: ["assignedOwnerId"],
      where: { status: { in: OPEN_STATUSES } },
      _count: { _all: true },
    }),
    prisma.enquiry.groupBy({
      by: ["assignedOwnerId"],
      _count: { _all: true },
    }),
    prisma.enquiry.findMany({
      select: { assignedOwnerId: true, dateReceived: true },
      orderBy: { dateReceived: "desc" },
      take: 500,
    }),
  ]);

  const openByOwner = new Map(
    openGroups.map((group) => [
      group.assignedOwnerId ?? "unassigned",
      group._count._all,
    ]),
  );

  const totalByOwner = new Map(
    totalGroups.map((group) => [
      group.assignedOwnerId ?? "unassigned",
      group._count._all,
    ]),
  );

  const lastByOwner = new Map<string, Date>();

  for (const enquiry of enquiries) {
    if (!enquiry.assignedOwnerId) continue;

    const existing = lastByOwner.get(enquiry.assignedOwnerId);

    if (!existing || enquiry.dateReceived > existing) {
      lastByOwner.set(enquiry.assignedOwnerId, enquiry.dateReceived);
    }
  }

  return members.map((member) => ({
    member,
    openCount: openByOwner.get(member.id) ?? 0,
    totalCount: totalByOwner.get(member.id) ?? 0,
    lastEnquiryAt: lastByOwner.get(member.id) ?? null,
  }));
}

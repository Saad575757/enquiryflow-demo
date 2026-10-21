"use server";

import { revalidatePath } from "next/cache";

import { EnquiryStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { seedDemoData } from "@/lib/demo-data";
import {
  enquiryFormSchema,
  enquiryUpdateSchema,
  followUpFormSchema,
  followUpToggleSchema,
  notesUpdateSchema,
  ownerUpdateSchema,
  statusUpdateSchema,
} from "@/lib/validation";

export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

function fieldErrorsFrom(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string[]> {
  const flattened = error.flatten().fieldErrors;
  const result: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) {
      result[key] = messages;
    }
  }

  return result;
}

function revalidateEnquiryViews(enquiryId?: string) {
  revalidatePath("/");
  revalidatePath("/enquiries");
  revalidatePath("/team");

  if (enquiryId) {
    revalidatePath(`/enquiries/${enquiryId}`);
  }
}

export async function createEnquiry(
  values: unknown,
): Promise<ActionResult & { id?: string }> {
  const parsed = enquiryFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Some details need attention before this enquiry can be saved.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const data = parsed.data;

  const enquiry = await prisma.enquiry.create({
    data: {
      title: data.title,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      organisation: data.organisation,
      enquiryType: data.enquiryType,
      source: data.source,
      description: data.description,
      dateReceived: data.dateReceived,
      assignedOwnerId: data.assignedOwnerId,
      status: EnquiryStatus.NEW,
      nextAction: data.nextAction,
      nextActionDueAt: data.nextActionDueAt,
    },
  });

  if (data.nextAction) {
    await prisma.followUpAction.create({
      data: {
        enquiryId: enquiry.id,
        action: data.nextAction,
        dueAt: data.nextActionDueAt,
      },
    });
  }

  revalidateEnquiryViews(enquiry.id);

  return { ok: true, id: enquiry.id };
}

export async function updateEnquiry(
  values: unknown,
): Promise<ActionResult> {
  const parsed = enquiryUpdateSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Some details need attention before this enquiry can be saved.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const data = parsed.data;

  const existing = await prisma.enquiry.findUnique({
    where: { id: data.id },
  });

  if (!existing) {
    return { ok: false, message: "That enquiry no longer exists." };
  }

  await prisma.enquiry.update({
    where: { id: existing.id },
    data: {
      title: data.title,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      organisation: data.organisation,
      enquiryType: data.enquiryType,
      source: data.source,
      description: data.description,
      dateReceived: data.dateReceived,
      assignedOwnerId: data.assignedOwnerId,
      nextAction: data.nextAction,
      nextActionDueAt: data.nextActionDueAt,
      nextActionCompletedAt: data.nextAction ? null : existing.nextActionCompletedAt,
    },
  });

  revalidateEnquiryViews(existing.id);

  return { ok: true };
}

export async function updateEnquiryStatus(
  enquiryId: string,
  status: string,
): Promise<ActionResult> {
  const parsed = statusUpdateSchema.safeParse({ enquiryId, status });

  if (!parsed.success) {
    return { ok: false, message: "That status is not valid." };
  }

  await prisma.enquiry.update({
    where: { id: parsed.data.enquiryId },
    data: { status: parsed.data.status },
  });

  revalidateEnquiryViews(parsed.data.enquiryId);

  return { ok: true };
}

export async function updateEnquiryOwner(
  enquiryId: string,
  assignedOwnerId: string | undefined,
): Promise<ActionResult> {
  const parsed = ownerUpdateSchema.safeParse({ enquiryId, assignedOwnerId });

  if (!parsed.success) {
    return { ok: false, message: "That owner is not valid." };
  }

  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: { assignedOwnerId: parsed.data.assignedOwnerId ?? null },
  });

  revalidateEnquiryViews(enquiryId);

  return { ok: true };
}

export async function updateInternalNotes(
  enquiryId: string,
  internalNotes: string,
): Promise<ActionResult> {
  const parsed = notesUpdateSchema.safeParse({ enquiryId, internalNotes });

  if (!parsed.success) {
    return { ok: false, message: "Those notes could not be saved." };
  }

  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: { internalNotes: parsed.data.internalNotes },
  });

  revalidateEnquiryViews(enquiryId);

  return { ok: true };
}

export async function addFollowUpAction(values: unknown): Promise<ActionResult> {
  const parsed = followUpFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "The action could not be saved.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const { enquiryId, action, dueAt } = parsed.data;

  const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });

  if (!enquiry) {
    return { ok: false, message: "That enquiry no longer exists." };
  }

  await prisma.followUpAction.create({
    data: { enquiryId, action, dueAt },
  });

  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      nextAction: action,
      nextActionDueAt: dueAt,
      nextActionCompletedAt: null,
    },
  });

  revalidateEnquiryViews(enquiryId);

  return { ok: true };
}

export async function toggleFollowUpAction(
  followUpId: string,
  completed: boolean,
): Promise<ActionResult> {
  const parsed = followUpToggleSchema.safeParse({ followUpId, completed });

  if (!parsed.success) {
    return { ok: false, message: "That action could not be updated." };
  }

  const followUp = await prisma.followUpAction.findUnique({
    where: { id: parsed.data.followUpId },
  });

  if (!followUp) {
    return { ok: false, message: "That action no longer exists." };
  }

  await prisma.followUpAction.update({
    where: { id: followUp.id },
    data: { completedAt: completed ? new Date() : null },
  });

  const enquiry = await prisma.enquiry.findUnique({
    where: { id: followUp.enquiryId },
  });

  if (enquiry && enquiry.nextAction === followUp.action) {
    await prisma.enquiry.update({
      where: { id: enquiry.id },
      data: { nextActionCompletedAt: completed ? new Date() : null },
    });
  }

  revalidateEnquiryViews(followUp.enquiryId);

  return { ok: true };
}

export async function deleteEnquiry(enquiryId: string): Promise<ActionResult> {
  await prisma.enquiry.delete({ where: { id: enquiryId } });

  revalidateEnquiryViews(enquiryId);

  return { ok: true };
}

export async function resetDemoData(): Promise<ActionResult> {
  await seedDemoData(prisma);

  revalidateEnquiryViews();

  return { ok: true, message: "Demo data has been reset." };
}

import { z } from "zod";

import {
  ENQUIRY_SOURCE_VALUES,
  ENQUIRY_STATUS_VALUES,
  ENQUIRY_TYPE_VALUES,
} from "@/lib/enquiry";

const optionalText = (label: string, max = 500) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalDate = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === "" ||
        /^\d{4}-\d{2}-\d{2}$/.test(value),
      `${label} must be a valid date`,
    )
    .transform((value) => (value ? new Date(`${value}T00:00:00`) : undefined));

const requiredDate = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be a valid date`)
    .transform((value) => new Date(`${value}T00:00:00`));

export const enquiryFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give the enquiry a short title")
    .max(120, "Title must be 120 characters or fewer"),
  contactName: z
    .string()
    .trim()
    .min(2, "Who is making the enquiry?")
    .max(80, "Contact name must be 80 characters or fewer"),
  email: z
    .union([
      z.email("Enter a valid email address"),
      z.literal("").transform(() => undefined),
    ])
    .optional(),
  phone: optionalText("Phone number", 40),
  organisation: optionalText("Organisation", 120),
  enquiryType: z.enum(ENQUIRY_TYPE_VALUES),
  source: z
    .union([
      z.enum(ENQUIRY_SOURCE_VALUES),
      z.literal("").transform(() => undefined),
    ])
    .optional(),
  description: optionalText("Description", 4000),
  dateReceived: requiredDate("Date received"),
  assignedOwnerId: z
    .union([
      z.string().trim().min(1),
      z.literal("").transform(() => undefined),
    ])
    .optional(),
  nextAction: optionalText("Next action", 200),
  nextActionDueAt: optionalDate("Due date"),
});

export type EnquiryFormValues = z.input<typeof enquiryFormSchema>;
export type EnquiryFormData = z.output<typeof enquiryFormSchema>;

export const enquiryUpdateSchema = enquiryFormSchema.extend({
  id: z.string().trim().min(1),
});

export type EnquiryUpdateValues = z.input<typeof enquiryUpdateSchema>;

export const followUpFormSchema = z.object({
  enquiryId: z.string().trim().min(1),
  action: z
    .string()
    .trim()
    .min(3, "Describe the action you are taking")
    .max(200, "Action must be 200 characters or fewer"),
  dueAt: optionalDate("Due date"),
});

export type FollowUpFormValues = z.input<typeof followUpFormSchema>;

export const statusUpdateSchema = z.object({
  enquiryId: z.string().trim().min(1),
  status: z.enum(ENQUIRY_STATUS_VALUES),
});

export const ownerUpdateSchema = z.object({
  enquiryId: z.string().trim().min(1),
  assignedOwnerId: z
    .union([
      z.string().trim().min(1),
      z.literal("").transform(() => undefined),
    ])
    .optional(),
});

export const notesUpdateSchema = z.object({
  enquiryId: z.string().trim().min(1),
  internalNotes: z.string().trim().max(4000, "Notes must be 4000 characters or fewer"),
});

export const followUpToggleSchema = z.object({
  followUpId: z.string().trim().min(1),
  completed: z.boolean(),
});

export const enquiryListSchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(ENQUIRY_STATUS_VALUES).optional(),
  type: z.enum(ENQUIRY_TYPE_VALUES).optional(),
  owner: z.string().trim().optional(),
  overdue: z.enum(["1"]).optional(),
});

export type EnquiryListFilters = z.infer<typeof enquiryListSchema>;

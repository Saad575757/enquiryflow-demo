import {
  EnquirySource,
  EnquiryStatus,
  EnquiryType,
} from "@/generated/prisma/enums";

export type StatusMeta = {
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  dotClass: string;
};

export const STATUS_ORDER: EnquiryStatus[] = [
  EnquiryStatus.NEW,
  EnquiryStatus.CONTACTED,
  EnquiryStatus.IN_PROGRESS,
  EnquiryStatus.AWAITING_RESPONSE,
  EnquiryStatus.QUALIFIED,
  EnquiryStatus.CONVERTED,
  EnquiryStatus.CLOSED_NOT_PROCEEDING,
];

export const STATUS_META: Record<EnquiryStatus, StatusMeta> = {
  NEW: {
    label: "New",
    shortLabel: "New",
    description: "Received but not yet actioned.",
    badgeClass: "bg-sky-100 text-sky-700 ring-sky-600/20",
    dotClass: "bg-sky-500",
  },
  CONTACTED: {
    label: "Contacted",
    shortLabel: "Contacted",
    description: "We have reached out to the enquirer.",
    badgeClass: "bg-indigo-100 text-indigo-700 ring-indigo-600/20",
    dotClass: "bg-indigo-500",
  },
  IN_PROGRESS: {
    label: "In progress",
    shortLabel: "In progress",
    description: "Actively being worked on.",
    badgeClass: "bg-violet-100 text-violet-700 ring-violet-600/20",
    dotClass: "bg-violet-500",
  },
  AWAITING_RESPONSE: {
    label: "Awaiting response",
    shortLabel: "Awaiting",
    description: "Ball is in the enquirer's court.",
    badgeClass: "bg-amber-100 text-amber-800 ring-amber-600/20",
    dotClass: "bg-amber-500",
  },
  QUALIFIED: {
    label: "Qualified",
    shortLabel: "Qualified",
    description: "Confirmed as a good fit.",
    badgeClass: "bg-teal-100 text-teal-700 ring-teal-600/20",
    dotClass: "bg-teal-500",
  },
  CONVERTED: {
    label: "Converted",
    shortLabel: "Converted",
    description: "Became a client / signed up.",
    badgeClass: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    dotClass: "bg-emerald-500",
  },
  CLOSED_NOT_PROCEEDING: {
    label: "Closed — not proceeding",
    shortLabel: "Closed",
    description: "No further action planned.",
    badgeClass: "bg-slate-200 text-slate-700 ring-slate-500/20",
    dotClass: "bg-slate-400",
  },
};

export const OPEN_STATUSES: EnquiryStatus[] = [
  EnquiryStatus.NEW,
  EnquiryStatus.CONTACTED,
  EnquiryStatus.IN_PROGRESS,
  EnquiryStatus.AWAITING_RESPONSE,
  EnquiryStatus.QUALIFIED,
];

export const TYPE_META: Record<EnquiryType, { label: string; description: string }> = {
  ADVISORY: { label: "Advisory", description: "One-off advice or guidance." },
  EDUCATION: { label: "Education", description: "Courses, programmes or curricula." },
  TRAINING: { label: "Training", description: "Workshops or staff training." },
  CONSULTATION: { label: "Consultation", description: "Consulting engagement." },
  OTHER: { label: "Other", description: "Anything that does not fit above." },
};

export const SOURCE_META: Record<EnquirySource, { label: string }> = {
  WEBSITE: { label: "Website" },
  REFERRAL: { label: "Referral" },
  EMAIL: { label: "Email" },
  PHONE: { label: "Phone" },
  LINKEDIN: { label: "LinkedIn" },
  OTHER: { label: "Other" },
};

export const ENQUIRY_TYPE_VALUES = Object.values(EnquiryType);
export const ENQUIRY_SOURCE_VALUES = Object.values(EnquirySource);
export const ENQUIRY_STATUS_VALUES = Object.values(EnquiryStatus);

export function isEnquiryStatus(value: string): value is EnquiryStatus {
  return (ENQUIRY_STATUS_VALUES as string[]).includes(value);
}

export function isEnquiryType(value: string): value is EnquiryType {
  return (ENQUIRY_TYPE_VALUES as string[]).includes(value);
}

export function isEnquirySource(value: string): value is EnquirySource {
  return (ENQUIRY_SOURCE_VALUES as string[]).includes(value);
}

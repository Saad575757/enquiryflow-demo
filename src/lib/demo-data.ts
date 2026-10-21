import type { PrismaClient } from "@/generated/prisma/client";
import { EnquirySource, EnquiryStatus, EnquiryType } from "@/generated/prisma/enums";

export const DEMO_TEAM_MEMBERS = [
  { name: "Amara Okafor", department: "Client Advisory" },
  { name: "Tomas Berger", department: "Training" },
  { name: "Priya Raman", department: "Consulting" },
  { name: "Jonah Whitfield", department: "Client Advisory" },
];

type DemoEnquiry = {
  demoRef: string;
  title: string;
  contactName: string;
  email: string;
  phone: string;
  organisation: string;
  enquiryType: EnquiryType;
  source: EnquirySource;
  description: string;
  daysAgo: number;
  status: EnquiryStatus;
  owner: number | null;
  nextAction?: string;
  nextActionInDays?: number;
  internalNotes?: string;
  followUps?: { action: string; dueInDays: number; completedInDays?: number }[];
};

export const DEMO_ENQUIRIES: DemoEnquiry[] = [
  {
    demoRef: "demo-001",
    title: "Safeguarding policy review for a primary school",
    contactName: "Helen Brooks",
    email: "helen.brooks@stmartinsprimary.org.uk",
    phone: "+44 161 496 0112",
    organisation: "St Martin's Primary School",
    enquiryType: EnquiryType.CONSULTATION,
    source: EnquirySource.REFERRAL,
    description:
      "The head teacher wants an independent review of the school's safeguarding policy before the new academic year.",
    daysAgo: 48,
    status: EnquiryStatus.CLOSED_NOT_PROCEEDING,
    owner: 0,
    internalNotes: "Budget did not extend to a full review. Referred them to the free policy template instead.",
    followUps: [
      { action: "Send policy template and signpost to the association", dueInDays: -40, completedInDays: -40 },
    ],
  },
  {
    demoRef: "demo-002",
    title: "Two-day staff training on inclusive classroom practice",
    contactName: "Marcus Adeyemi",
    email: "m.adeyemi@horizonacademy.org.uk",
    phone: "+44 20 7946 0991",
    organisation: "Horizon Academy Trust",
    enquiryType: EnquiryType.TRAINING,
    source: EnquirySource.WEBSITE,
    description:
      "Twelve teaching assistants across two sites would like training on supporting pupils with additional needs.",
    daysAgo: 41,
    status: EnquiryStatus.QUALIFIED,
    owner: 1,
    nextAction: "Confirm dates and send the training proposal",
    nextActionInDays: 3,
    internalNotes: "Budget confirmed by trust. Prefer a Tuesday or Thursday.",
    followUps: [
      { action: "Call to confirm the number of attendees", dueInDays: -30, completedInDays: -29 },
      { action: "Send the training proposal", dueInDays: 3 },
    ],
  },
  {
    demoRef: "demo-003",
    title: "PhD supervision request — educational leadership",
    contactName: "Dr Sofia Lindqvist",
    email: "s.lindqvist@ucl.ac.uk",
    phone: "+44 20 7679 0000",
    organisation: "UCL Institute of Education",
    enquiryType: EnquiryType.EDUCATION,
    source: EnquirySource.EMAIL,
    description:
      "Looking for a supervisor with sector experience for a part-time doctorate focused on school turnaround.",
    daysAgo: 37,
    status: EnquiryStatus.IN_PROGRESS,
    owner: 2,
    nextAction: "Share two supervisor profiles with the department",
    nextActionInDays: 1,
    internalNotes: "Supervisor availability is limited in the autumn term.",
    followUps: [
      { action: "Check supervisor availability for the autumn", dueInDays: -20, completedInDays: -20 },
      { action: "Share supervisor profiles", dueInDays: 1 },
    ],
  },
  {
    demoRef: "demo-004",
    title: "Parent evening workshop — cohort of 30",
    contactName: "Rachel Nkemdirim",
    email: "rachel@brightpathschools.co.uk",
    phone: "+44 117 496 2210",
    organisation: "Brightpath Schools",
    enquiryType: EnquiryType.TRAINING,
    source: EnquirySource.PHONE,
    description:
      "Evening session for parents on supporting children's reading at home, with an option to buy the materials pack.",
    daysAgo: 33,
    status: EnquiryStatus.CONVERTED,
    owner: 1,
    internalNotes: "Signed off on 14 October. Materials pack ordered.",
    followUps: [
      { action: "Send the invoice", dueInDays: -12, completedInDays: -12 },
      { action: "Confirm venue access for the evening", dueInDays: -6, completedInDays: -6 },
    ],
  },
  {
    demoRef: "demo-005",
    title: "Curriculum audit for a MAT with nine schools",
    contactName: "Daniel Okoye",
    email: "daniel.okoye@meridianmat.org.uk",
    phone: "+44 20 3800 1122",
    organisation: "Meridian Multi-Academy Trust",
    enquiryType: EnquiryType.CONSULTATION,
    source: EnquirySource.LINKEDIN,
    description:
      "Wants an independent curriculum audit across a trust covering nine schools, with a report for governors.",
    daysAgo: 29,
    status: EnquiryStatus.AWAITING_RESPONSE,
    owner: 2,
    nextAction: "Chase for the trust's finance sign-off",
    nextActionInDays: -2,
    internalNotes: "Awaiting confirmation that the budget code has been approved internally.",
    followUps: [
      { action: "Send the scoping document", dueInDays: -22, completedInDays: -21 },
      { action: "Chase finance sign-off", dueInDays: -2 },
    ],
  },
  {
    demoRef: "demo-006",
    title: "Reading intervention refresher for teaching assistants",
    contactName: "Fiona McAllister",
    email: "f.mcallister@oakfieldacademy.co.uk",
    phone: "+44 131 555 0193",
    organisation: "Oakfield Academy",
    enquiryType: EnquiryType.TRAINING,
    source: EnquirySource.WEBSITE,
    description:
      "Short refresher session on delivering the reading intervention used in their catch-up programme.",
    daysAgo: 26,
    status: EnquiryStatus.CONTACTED,
    owner: 1,
    nextAction: "Send the available dates",
    nextActionInDays: 2,
    followUps: [
      { action: "Send the available dates", dueInDays: 2 },
    ],
  },
  {
    demoRef: "demo-007",
    title: "Behaviour support advice for a new head of year",
    contactName: "Nathan Reilly",
    email: "nreilly@westgate-high.org.uk",
    phone: "+44 161 496 7744",
    organisation: "Westgate High School",
    enquiryType: EnquiryType.ADVISORY,
    source: EnquirySource.EMAIL,
    description:
      "One-to-one advisory session on setting up a new year group and establishing consistent routines.",
    daysAgo: 22,
    status: EnquiryStatus.NEW,
    owner: 3,
    nextAction: "Book an introductory call",
    nextActionInDays: 1,
    followUps: [
      { action: "Book an introductory call", dueInDays: 1 },
    ],
  },
  {
    demoRef: "demo-008",
    title: "Assessment data for a local authority consortium",
    contactName: "Grace Chimwemwe",
    email: "g.chimwemwe@northshire.gov.uk",
    phone: "+44 161 555 6677",
    organisation: "Northshire Council",
    enquiryType: EnquiryType.CONSULTATION,
    source: EnquirySource.REFERRAL,
    description:
      "Consortium of eight schools wants support analysing KS2 outcomes and producing an action plan.",
    daysAgo: 19,
    status: EnquiryStatus.IN_PROGRESS,
    owner: 0,
    nextAction: "Confirm the data-sharing agreement",
    nextActionInDays: 4,
    internalNotes: "DSA needs review by their legal team before data can be shared.",
    followUps: [
      { action: "Draft the data-sharing agreement", dueInDays: -9, completedInDays: -9 },
      { action: "Confirm the data-sharing agreement", dueInDays: 4 },
    ],
  },
  {
    demoRef: "demo-009",
    title: "Six-week teaching assistant apprenticeship cohort",
    contactName: "Owen Pritchard",
    email: "owen.pritchard@apprenticeshipsuk.org",
    phone: "+44 121 555 0044",
    organisation: "Apprenticeships UK",
    enquiryType: EnquiryType.EDUCATION,
    source: EnquirySource.WEBSITE,
    description:
      "Looking to deliver an apprenticeship programme for teaching assistants, including assessment design.",
    daysAgo: 16,
    status: EnquiryStatus.QUALIFIED,
    owner: 2,
    nextAction: "Send the programme outline and costing",
    nextActionInDays: 5,
    followUps: [
      { action: "Share the programme outline", dueInDays: -8, completedInDays: -8 },
      { action: "Send the costing", dueInDays: 5 },
    ],
  },
  {
    demoRef: "demo-010",
    title: "Behaviour policy rewrite — independent school",
    contactName: "Alice Kowalski",
    email: "a.kowalski@bramblehurst.co.uk",
    phone: "+44 1752 555 331",
    organisation: "Bramblehurst School",
    enquiryType: EnquiryType.ADVISORY,
    source: EnquirySource.PHONE,
    description:
      "Head wants the behaviour policy rewritten so that it reads consistently across the whole school.",
    daysAgo: 14,
    status: EnquiryStatus.NEW,
    owner: null,
    followUps: [],
  },
  {
    demoRef: "demo-011",
    title: "Governor induction session for three new governors",
    contactName: "Yusuf Rahman",
    email: "y.rahman@newbridgeacademy.org.uk",
    phone: "+44 20 7946 8871",
    organisation: "Newbridge Academy",
    enquiryType: EnquiryType.TRAINING,
    source: EnquirySource.EMAIL,
    description:
      "Three recently appointed governors need an induction covering their legal duties and the school's systems.",
    daysAgo: 11,
    status: EnquiryStatus.CONTACTED,
    owner: 3,
    nextAction: "Offer two dates for the induction session",
    nextActionInDays: 6,
    followUps: [
      { action: "Offer two dates for the induction session", dueInDays: 6 },
    ],
  },
  {
    demoRef: "demo-012",
    title: "Reading assessment data import and analysis",
    contactName: "Elena Vasquez",
    email: "elena.v@stpeterscollege.org.uk",
    phone: "+44 161 555 1234",
    organisation: "St Peter's College",
    enquiryType: EnquiryType.CONSULTATION,
    source: EnquirySource.WEBSITE,
    description:
      "Would like help importing historic assessment data and turning it into a school-level progress report.",
    daysAgo: 9,
    status: EnquiryStatus.IN_PROGRESS,
    owner: 0,
    nextAction: "Send the data template",
    nextActionInDays: -1,
    internalNotes: "Second chase sent — they have not replied since Tuesday.",
    followUps: [
      { action: "Send the data template", dueInDays: -1 },
    ],
  },
  {
    demoRef: "demo-013",
    title: "Induction training for three new teaching assistants",
    contactName: "Samuel Osei",
    email: "s.osei@larkhillprimary.org.uk",
    phone: "+44 113 555 9080",
    organisation: "Larkhill Primary School",
    enquiryType: EnquiryType.TRAINING,
    source: EnquirySource.REFERRAL,
    description:
      "Basic induction covering safeguarding, behaviour, and the school's reading programme.",
    daysAgo: 7,
    status: EnquiryStatus.CONVERTED,
    owner: 1,
    internalNotes: "Booked for the second week of the new term.",
    followUps: [
      { action: "Confirm the booking", dueInDays: -4, completedInDays: -4 },
    ],
  },
  {
    demoRef: "demo-014",
    title: "Advanced qualification in education leadership",
    contactName: "Charlotte Nguyen",
    email: "c.nguyen@riseupcollege.ac.uk",
    phone: "+44 161 555 0021",
    organisation: "Riseup College",
    enquiryType: EnquiryType.EDUCATION,
    source: EnquirySource.WEBSITE,
    description:
      "Asking about entry requirements for the part-time advanced qualification and the September intake.",
    daysAgo: 5,
    status: EnquiryStatus.NEW,
    owner: 2,
    nextAction: "Send the entry requirements and prospectus",
    nextActionInDays: 2,
    followUps: [
      { action: "Send the entry requirements and prospectus", dueInDays: 2 },
    ],
  },
  {
    demoRef: "demo-015",
    title: "Safeguarding training refreshers for a trust of five schools",
    contactName: "Michael O'Brien",
    email: "m.obrien@stonebridgeacademytrust.org.uk",
    phone: "+44 20 3800 5500",
    organisation: "Stonebridge Academy Trust",
    enquiryType: EnquiryType.TRAINING,
    source: EnquirySource.EMAIL,
    description:
      "Annual refresher training for around 60 staff across five schools, delivered in two cohorts.",
    daysAgo: 4,
    status: EnquiryStatus.CONTACTED,
    owner: 1,
    nextAction: "Arrange a call with the trust operations lead",
    nextActionInDays: 1,
    followUps: [
      { action: "Arrange a call with the trust operations lead", dueInDays: 1 },
    ],
  },
  {
    demoRef: "demo-016",
    title: "School improvement review after an inspection",
    contactName: "Aisha Bello",
    email: "a.bello@kingfisheracademy.co.uk",
    phone: "+44 131 555 2200",
    organisation: "Kingfisher Academy",
    enquiryType: EnquiryType.CONSULTATION,
    source: EnquirySource.REFERRAL,
    description:
      "Requested a review of the school's improvement plan following a 'requires improvement' inspection.",
    daysAgo: 3,
    status: EnquiryStatus.NEW,
    owner: null,
    followUps: [],
  },
  {
    demoRef: "demo-017",
    title: "Attendance and punctuality strategy consultation",
    contactName: "Ruth Kowalczyk",
    email: "ruth.k@eastvaleacademy.org.uk",
    phone: "+44 131 555 7744",
    organisation: "Eastvale Academy",
    enquiryType: EnquiryType.ADVISORY,
    source: EnquirySource.LINKEDIN,
    description:
      "Attendance has dropped since the new term and the head wants an external perspective on the strategy.",
    daysAgo: 2,
    status: EnquiryStatus.NEW,
    owner: 3,
    nextAction: "Send an example strategy pack",
    nextActionInDays: 3,
    followUps: [
      { action: "Send an example strategy pack", dueInDays: 3 },
    ],
  },
  {
    demoRef: "demo-018",
    title: "Online course platform migration support",
    contactName: "Victor Mensah",
    email: "v.mensah@continentlearning.org",
    phone: "+44 20 3800 7712",
    organisation: "Continent Learning",
    enquiryType: EnquiryType.EDUCATION,
    source: EnquirySource.WEBSITE,
    description:
      "Moving roughly 4,000 learner records from an old platform and keeping the enrolments intact.",
    daysAgo: 2,
    status: EnquiryStatus.CONTACTED,
    owner: 2,
    nextAction: "Book a technical scoping call",
    nextActionInDays: 4,
    followUps: [
      { action: "Book a technical scoping call", dueInDays: 4 },
    ],
  },
  {
    demoRef: "demo-019",
    title: "Governor training for a new academy trust",
    contactName: "Isabelle Fontaine",
    email: "i.fontaine@newhavenat.uk",
    phone: "+44 161 555 4400",
    organisation: "Newhaven Academy Trust",
    enquiryType: EnquiryType.TRAINING,
    source: EnquirySource.EMAIL,
    description:
      "Newly converted trust wants training for governors on finance and compliance in academies.",
    daysAgo: 1,
    status: EnquiryStatus.NEW,
    owner: 1,
    nextAction: "Send the training options for the trust",
    nextActionInDays: 2,
    followUps: [
      { action: "Send the training options for the trust", dueInDays: 2 },
    ],
  },
  {
    demoRef: "demo-020",
    title: "Marking and feedback workload consultation",
    contactName: "Ben Achterberg",
    email: "b.achterberg@northgateacademy.org.uk",
    phone: "+44 131 555 3322",
    organisation: "Northgate Academy",
    enquiryType: EnquiryType.ADVISORY,
    source: EnquirySource.PHONE,
    description:
      "Teachers are spending too long on marking; the deputy head wants to explore policy changes.",
    daysAgo: 1,
    status: EnquiryStatus.NEW,
    owner: 0,
    nextAction: "Confirm the consultation slot",
    nextActionInDays: 1,
    followUps: [
      { action: "Confirm the consultation slot", dueInDays: 1 },
    ],
  },
  {
    demoRef: "demo-021",
    title: "Curriculum mapping for a bilingual school",
    contactName: "Lena Hartmann",
    email: "l.hartmann@springsbilingual.de",
    phone: "+49 30 555 0192",
    organisation: "Springs Bilingual School",
    enquiryType: EnquiryType.CONSULTATION,
    source: EnquirySource.EMAIL,
    description:
      "Mapping two curricula across a bilingual programme, including sequencing of language content.",
    daysAgo: 0,
    status: EnquiryStatus.NEW,
    owner: null,
    followUps: [],
  },
  {
    demoRef: "demo-022",
    title: "Teaching assistant professional development programme",
    contactName: "Nathaniel Osei",
    email: "n.osei@hearthstoweacademy.org.uk",
    phone: "+44 161 555 8877",
    organisation: "Hearthstowe Academy",
    enquiryType: EnquiryType.EDUCATION,
    source: EnquirySource.WEBSITE,
    description:
      "A structured development programme for newly qualified teaching assistants across the year.",
    daysAgo: 0,
    status: EnquiryStatus.NEW,
    owner: 2,
    nextAction: "Send the programme handbook",
    nextActionInDays: 5,
    followUps: [
      { action: "Send the programme handbook", dueInDays: 5 },
    ],
  },
  {
    demoRef: "demo-023",
    title: "Behaviour and attendance review for a pupil support team",
    contactName: "Georgia Whitmore",
    email: "g.whitmore@chestertoncourt.sch.uk",
    phone: "+44 121 555 1100",
    organisation: "Chesterton Court School",
    enquiryType: EnquiryType.ADVISORY,
    source: EnquirySource.REFERRAL,
    description:
      "Support team wants an external review of the behaviour and attendance plan for a small cohort.",
    daysAgo: 0,
    status: EnquiryStatus.NEW,
    owner: 3,
    nextAction: "Ask for the current plan and context notes",
    nextActionInDays: 2,
    followUps: [
      { action: "Ask for the current plan and context notes", dueInDays: 2 },
    ],
  },
  {
    demoRef: "demo-024",
    title: "School website accessibility audit",
    contactName: "Tobias Frank",
    email: "tobias.frank@longbeachacademy.org.uk",
    phone: "+44 131 555 6600",
    organisation: "Longbeach Academy",
    enquiryType: EnquiryType.CONSULTATION,
    source: EnquirySource.OTHER,
    description:
      "Accessibility audit of the school website against the latest accessibility standards.",
    daysAgo: 0,
    status: EnquiryStatus.NEW,
    owner: 0,
    nextAction: "Request access to the staging site",
    nextActionInDays: 3,
    followUps: [
      { action: "Request access to the staging site", dueInDays: 3 },
    ],
  },
];

function daysFromNow(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Recreates the demo dataset. Demo enquiries are always deleted first, so the
 * function is safe to call repeatedly (seed, "reset demo data" action).
 */
export async function seedDemoData(prisma: PrismaClient) {
  const memberIds: string[] = [];

  for (const member of DEMO_TEAM_MEMBERS) {
    const existing = await prisma.teamMember.findFirst({
      where: { name: member.name },
    });

    if (existing) {
      memberIds.push(existing.id);
      continue;
    }

    const created = await prisma.teamMember.create({ data: member });
    memberIds.push(created.id);
  }

  await prisma.enquiry.deleteMany({ where: { isDemoRecord: true } });

  for (const enquiry of DEMO_ENQUIRIES) {
    const ownerId =
      enquiry.owner === null || enquiry.owner === undefined
        ? null
        : memberIds[enquiry.owner];

    const created = await prisma.enquiry.create({
      data: {
        demoRef: enquiry.demoRef,
        isDemoRecord: true,
        title: enquiry.title,
        contactName: enquiry.contactName,
        email: enquiry.email,
        phone: enquiry.phone,
        organisation: enquiry.organisation,
        enquiryType: enquiry.enquiryType,
        source: enquiry.source,
        description: enquiry.description,
        dateReceived: daysFromNow(-enquiry.daysAgo),
        status: enquiry.status,
        assignedOwnerId: ownerId,
        internalNotes: enquiry.internalNotes,
        nextAction: enquiry.nextAction ?? null,
        nextActionDueAt:
          enquiry.nextAction && enquiry.nextActionInDays !== undefined
            ? daysFromNow(enquiry.nextActionInDays)
            : null,
      },
    });

    for (const followUp of enquiry.followUps ?? []) {
      await prisma.followUpAction.create({
        data: {
          enquiryId: created.id,
          action: followUp.action,
          dueAt: daysFromNow(followUp.dueInDays),
          completedAt:
            followUp.completedInDays !== undefined
              ? daysFromNow(followUp.completedInDays)
              : null,
        },
      });
    }
  }

  return {
    teamMembers: DEMO_TEAM_MEMBERS.length,
    enquiries: DEMO_ENQUIRIES.length,
  };
}

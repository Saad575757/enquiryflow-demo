-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'QUALIFIED', 'CONVERTED', 'CLOSED_NOT_PROCEEDING');

-- CreateEnum
CREATE TYPE "EnquiryType" AS ENUM ('ADVISORY', 'EDUCATION', 'TRAINING', 'CONSULTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "EnquirySource" AS ENUM ('WEBSITE', 'REFERRAL', 'EMAIL', 'PHONE', 'LINKEDIN', 'OTHER');

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "organisation" TEXT,
    "enquiryType" "EnquiryType" NOT NULL DEFAULT 'OTHER',
    "source" "EnquirySource",
    "description" TEXT,
    "dateReceived" TIMESTAMP(3) NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assignedOwnerId" TEXT,
    "nextAction" TEXT,
    "nextActionDueAt" TIMESTAMP(3),
    "nextActionCompletedAt" TIMESTAMP(3),
    "internalNotes" TEXT,
    "isDemoRecord" BOOLEAN NOT NULL DEFAULT false,
    "demoRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpAction" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUpAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamMember_name_idx" ON "TeamMember"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_demoRef_key" ON "Enquiry"("demoRef");

-- CreateIndex
CREATE INDEX "Enquiry_status_idx" ON "Enquiry"("status");

-- CreateIndex
CREATE INDEX "Enquiry_assignedOwnerId_idx" ON "Enquiry"("assignedOwnerId");

-- CreateIndex
CREATE INDEX "Enquiry_dateReceived_idx" ON "Enquiry"("dateReceived");

-- CreateIndex
CREATE INDEX "Enquiry_nextActionDueAt_idx" ON "Enquiry"("nextActionDueAt");

-- CreateIndex
CREATE INDEX "Enquiry_isDemoRecord_idx" ON "Enquiry"("isDemoRecord");

-- CreateIndex
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

-- CreateIndex
CREATE INDEX "FollowUpAction_enquiryId_idx" ON "FollowUpAction"("enquiryId");

-- CreateIndex
CREATE INDEX "FollowUpAction_completedAt_idx" ON "FollowUpAction"("completedAt");

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_assignedOwnerId_fkey" FOREIGN KEY ("assignedOwnerId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpAction" ADD CONSTRAINT "FollowUpAction_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

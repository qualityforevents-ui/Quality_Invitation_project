-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'AWAITING_CONFIRMATION', 'ACTIVE', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('AR', 'EN');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ENGAGEMENT', 'WEDDING', 'KATB_KETAB');

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "editToken" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "uiLang" "Lang" NOT NULL DEFAULT 'AR',
    "invitationLang" "Lang" NOT NULL DEFAULT 'AR',
    "eventType" "EventType" NOT NULL DEFAULT 'ENGAGEMENT',
    "name1" TEXT NOT NULL,
    "name2" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventTime" TEXT NOT NULL,
    "venueName" TEXT NOT NULL,
    "venueMapUrl" TEXT,
    "customMessage" TEXT,
    "themeId" TEXT NOT NULL,
    "musicTrackId" TEXT NOT NULL,
    "photoFileId" TEXT,
    "photoCrop" JSONB,
    "ogImageUrl" TEXT,
    "customerPhone" TEXT,
    "paymentNote" TEXT,
    "rejectReason" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Heartbeat" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "beatAt" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Heartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_editToken_key" ON "Invitation"("editToken");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_slug_key" ON "Invitation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_requestId_key" ON "Invitation"("requestId");

-- CreateIndex
CREATE INDEX "Invitation_status_createdAt_idx" ON "Invitation"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Invitation_customerPhone_idx" ON "Invitation"("customerPhone");

-- CreateIndex
CREATE INDEX "Invitation_createdAt_idx" ON "Invitation"("createdAt");

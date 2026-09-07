-- AlterTable
-- Defaulted to Ar-Rum 21 because that is the verse every card carried before the
-- question was asked, so existing invitations keep rendering exactly as they were sold.
ALTER TABLE "Invitation" ADD COLUMN     "verseId" TEXT NOT NULL DEFAULT 'ar-rum-21';

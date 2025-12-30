-- AlterTable
ALTER TABLE "BookingLead" ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmCapturedAt" TIMESTAMP(3),
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "utmTerm" TEXT;

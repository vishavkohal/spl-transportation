-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingType" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN     "hourlyHours" INTEGER,
ADD COLUMN     "hourlyPickupLocation" TEXT,
ADD COLUMN     "hourlyVehicleType" TEXT;

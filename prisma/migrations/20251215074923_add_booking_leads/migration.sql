-- CreateTable
CREATE TABLE "BookingLead" (
    "id" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "pickupLocation" TEXT,
    "pickupAddress" TEXT,
    "dropoffLocation" TEXT,
    "dropoffAddress" TEXT,
    "pickupDate" TEXT,
    "pickupTime" TEXT,
    "passengers" INTEGER,
    "luggage" INTEGER,
    "flightNumber" TEXT,
    "childSeat" BOOLEAN,
    "hourlyPickupLocation" TEXT,
    "hourlyHours" INTEGER,
    "hourlyVehicleType" TEXT,
    "fullName" TEXT,
    "email" TEXT,
    "contactNumber" TEXT,
    "quotedPriceCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingLead_pkey" PRIMARY KEY ("id")
);

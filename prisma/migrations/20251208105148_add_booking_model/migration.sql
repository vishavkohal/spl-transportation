-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "pickupAddress" TEXT,
    "dropoffLocation" TEXT NOT NULL,
    "dropoffAddress" TEXT,
    "pickupDate" TEXT NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "passengers" INTEGER NOT NULL,
    "luggage" INTEGER NOT NULL,
    "flightNumber" TEXT,
    "childSeat" BOOLEAN NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "totalPriceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripeSessionId_key" ON "Booking"("stripeSessionId");

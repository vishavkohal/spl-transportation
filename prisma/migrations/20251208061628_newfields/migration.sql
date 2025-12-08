/*
  Warnings:
  
  -- The original warning is noted but will be bypassed by the manual SQL steps below.
*/

-- AlterTable (Route)
-- These fields are nullable (TEXT without NOT NULL), so they are safe to add directly.
ALTER TABLE "Route" ADD COLUMN "description" TEXT,
ADD COLUMN "label" TEXT;

-- AlterTable (RoutePricing)
-- This section is manually updated to handle existing data:
-- 1. Add column as nullable.
ALTER TABLE "RoutePricing" ADD COLUMN "vehicleType" TEXT;

-- 2. Populate existing rows with a default value.
-- CHANGE 'Sedan' to whatever default vehicle type is appropriate for your application.
UPDATE "RoutePricing" SET "vehicleType" = 'Sedan' WHERE "vehicleType" IS NULL;

-- 3. Set the column to be NOT NULL (required).
ALTER TABLE "RoutePricing" ALTER COLUMN "vehicleType" SET NOT NULL;
-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "duration" TEXT NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutePricing" (
    "id" SERIAL NOT NULL,
    "passengers" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,

    CONSTRAINT "RoutePricing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoutePricing" ADD CONSTRAINT "RoutePricing_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

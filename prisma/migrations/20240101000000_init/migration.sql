-- CreateExtension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addresses_latitude_longitude_idx" ON "addresses"("latitude", "longitude");

-- Create spatial index for PostGIS (optional but recommended)
-- This requires converting lat/lng to geography type for better performance
CREATE INDEX IF NOT EXISTS "addresses_location_idx" 
ON "addresses" 
USING GIST (ST_MakePoint(longitude, latitude)::geography);

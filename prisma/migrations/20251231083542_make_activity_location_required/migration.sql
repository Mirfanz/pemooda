/*
  Warnings:

  - Made the column `location` on table `activities` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "location" SET NOT NULL;

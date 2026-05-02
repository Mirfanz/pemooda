/*
  Warnings:

  - You are about to drop the column `email` on the `attendees` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `attendees` table. All the data in the column will be lost.
  - Made the column `user_id` on table `attendees` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "attendees_email_idx";

-- AlterTable
ALTER TABLE "attendees" DROP COLUMN "email",
DROP COLUMN "name",
ALTER COLUMN "user_id" SET NOT NULL;

/*
  Warnings:

  - You are about to drop the column `is_open` on the `attendances` table. All the data in the column will be lost.
  - Added the required column `name` to the `attendances` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "attendances_activity_id_key";

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "is_open",
ADD COLUMN     "allow_external_users" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "attendees" ADD COLUMN     "email" CITEXT,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "attendees_email_idx" ON "attendees"("email");

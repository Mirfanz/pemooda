-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "total_absent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_excuse" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_pending" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_present" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "attendees" ADD COLUMN     "attended_at" TIMESTAMP(3);

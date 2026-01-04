-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "image_url" TEXT;

-- CreateIndex
CREATE INDEX "activities_is_public_idx" ON "activities"("is_public");

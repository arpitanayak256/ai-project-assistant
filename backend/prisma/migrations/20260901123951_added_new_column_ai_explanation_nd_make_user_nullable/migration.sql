-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_ownerId_fkey";

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "aiExplanation" TEXT;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

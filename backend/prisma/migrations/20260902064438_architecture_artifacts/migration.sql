-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "apiEndpoints" JSONB,
ADD COLUMN     "architectureDiagram" TEXT,
ADD COLUMN     "databaseSchema" JSONB;

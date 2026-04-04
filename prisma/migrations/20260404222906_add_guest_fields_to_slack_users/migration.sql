-- AlterTable
ALTER TABLE "slack_users" ADD COLUMN     "is_restricted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_ultra_restricted" BOOLEAN NOT NULL DEFAULT false;

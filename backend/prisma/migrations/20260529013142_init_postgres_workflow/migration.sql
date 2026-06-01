-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('PHYSICAL', 'REMOTE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REPORTER', 'EDITOR', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'REPORTER',
    "location" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "caseName" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "assignmentType" "AssignmentType" NOT NULL DEFAULT 'REMOTE',
    "location" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "editorId" TEXT,
    "transcriptionResult" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'NEW',
    "reporterRatePerMinute" INTEGER NOT NULL,
    "editorFlatRate" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "reporterEarnings" INTEGER NOT NULL,
    "editorEarnings" INTEGER NOT NULL,
    "totalPayout" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

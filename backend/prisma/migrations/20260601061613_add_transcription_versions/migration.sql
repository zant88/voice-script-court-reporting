-- CreateTable
CREATE TABLE "TranscriptionVersion" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptionVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TranscriptionVersion" ADD CONSTRAINT "TranscriptionVersion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptionVersion" ADD CONSTRAINT "TranscriptionVersion_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

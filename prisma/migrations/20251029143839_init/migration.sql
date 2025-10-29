-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataHash" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "anos" TEXT[],
    "modalidades" TEXT[],
    "turmas" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadedFile_dataHash_key" ON "UploadedFile"("dataHash");

-- CreateIndex
CREATE INDEX "UploadedFile_dataHash_idx" ON "UploadedFile"("dataHash");

-- CreateIndex
CREATE INDEX "UploadedFile_uploadDate_idx" ON "UploadedFile"("uploadDate");

-- CreateIndex
CREATE INDEX "UploadedFile_anos_idx" ON "UploadedFile"("anos");

-- CreateIndex
CREATE INDEX "UploadedFile_modalidades_idx" ON "UploadedFile"("modalidades");

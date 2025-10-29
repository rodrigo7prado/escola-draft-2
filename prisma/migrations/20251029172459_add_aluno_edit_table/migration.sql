-- CreateTable
CREATE TABLE "AlunoEdit" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorOriginal" TEXT,
    "valorEditado" TEXT NOT NULL,
    "motivo" TEXT,
    "editadoPor" TEXT,
    "editadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlunoEdit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlunoEdit_matricula_idx" ON "AlunoEdit"("matricula");

-- CreateIndex
CREATE INDEX "AlunoEdit_editadoEm_idx" ON "AlunoEdit"("editadoEm");

-- CreateIndex
CREATE INDEX "AlunoEdit_matricula_campo_idx" ON "AlunoEdit"("matricula", "campo");

-- CreateTable
CREATE TABLE "enturmacoes" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "anoLetivo" VARCHAR(10) NOT NULL,
    "regime" INTEGER NOT NULL DEFAULT 0,
    "modalidade" VARCHAR(100) NOT NULL,
    "turma" VARCHAR(50) NOT NULL,
    "serie" VARCHAR(10) NOT NULL,
    "turno" VARCHAR(20),
    "origemTipo" TEXT NOT NULL,
    "linhaOrigemId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enturmacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enturmacoes_alunoId_idx" ON "enturmacoes"("alunoId");

-- CreateIndex
CREATE INDEX "enturmacoes_anoLetivo_idx" ON "enturmacoes"("anoLetivo");

-- CreateIndex
CREATE INDEX "enturmacoes_modalidade_idx" ON "enturmacoes"("modalidade");

-- CreateIndex
CREATE INDEX "enturmacoes_turma_idx" ON "enturmacoes"("turma");

-- AddForeignKey
ALTER TABLE "enturmacoes" ADD CONSTRAINT "enturmacoes_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enturmacoes" ADD CONSTRAINT "enturmacoes_linhaOrigemId_fkey" FOREIGN KEY ("linhaOrigemId") REFERENCES "linhas_importadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

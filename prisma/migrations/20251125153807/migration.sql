/*
  Warnings:

  - A unique constraint covering the columns `[alunoMatricula,anoLetivo,periodoLetivo,curso,serie]` on the table `series_cursadas` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "series_cursadas_alunoMatricula_modalidade_segmento_curso_se_key";

-- AlterTable
ALTER TABLE "series_cursadas" ADD COLUMN     "cargaHorariaTotal" INTEGER,
ADD COLUMN     "frequenciaGlobal" DOUBLE PRECISION,
ADD COLUMN     "situacaoFinal" VARCHAR(100),
ADD COLUMN     "totalPontos" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "historicos_escolares" (
    "id" TEXT NOT NULL,
    "serieCursadaId" TEXT NOT NULL,
    "componenteCurricular" VARCHAR(200) NOT NULL,
    "cargaHoraria" INTEGER,
    "frequencia" DOUBLE PRECISION,
    "totalPontos" DOUBLE PRECISION,
    "faltasTotais" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historicos_escolares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historicos_escolares_serieCursadaId_idx" ON "historicos_escolares"("serieCursadaId");

-- CreateIndex
CREATE UNIQUE INDEX "series_cursadas_alunoMatricula_anoLetivo_periodoLetivo_curs_key" ON "series_cursadas"("alunoMatricula", "anoLetivo", "periodoLetivo", "curso", "serie");

-- AddForeignKey
ALTER TABLE "historicos_escolares" ADD CONSTRAINT "historicos_escolares_serieCursadaId_fkey" FOREIGN KEY ("serieCursadaId") REFERENCES "series_cursadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "alunos" ADD COLUMN     "anoIngressoEscolar" INTEGER,
ADD COLUMN     "dataInclusaoIngressoEscolar" TIMESTAMP(3),
ADD COLUMN     "matrizCurricularEscolar" VARCHAR(100),
ADD COLUMN     "periodoIngressoEscolar" INTEGER,
ADD COLUMN     "redeOrigemIngressoEscolar" VARCHAR(100),
ADD COLUMN     "tipoIngressoEscolar" VARCHAR(50);

-- CreateTable
CREATE TABLE "series_cursadas" (
    "id" TEXT NOT NULL,
    "alunoMatricula" VARCHAR(15) NOT NULL,
    "anoLetivo" VARCHAR(4) NOT NULL,
    "periodoLetivo" VARCHAR(2) NOT NULL,
    "unidadeEnsino" VARCHAR(200),
    "codigoEscola" VARCHAR(20),
    "modalidade" VARCHAR(100),
    "segmento" VARCHAR(100),
    "curso" VARCHAR(200),
    "serie" VARCHAR(100),
    "turno" VARCHAR(20),
    "situacao" VARCHAR(100),
    "tipoVaga" VARCHAR(100),
    "matrizCurricular" VARCHAR(100),
    "dataInclusaoAluno" TIMESTAMP(3),
    "tipoIngresso" VARCHAR(50),
    "redeEnsinoOrigem" VARCHAR(100),
    "ensinoReligioso" BOOLEAN,
    "linguaEstrangeira" BOOLEAN,
    "textoBrutoOrigemId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_cursadas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "series_cursadas_alunoMatricula_idx" ON "series_cursadas"("alunoMatricula");

-- CreateIndex
CREATE UNIQUE INDEX "series_cursadas_alunoMatricula_modalidade_segmento_curso_se_key" ON "series_cursadas"("alunoMatricula", "modalidade", "segmento", "curso", "serie");

-- AddForeignKey
ALTER TABLE "series_cursadas" ADD CONSTRAINT "series_cursadas_alunoMatricula_fkey" FOREIGN KEY ("alunoMatricula") REFERENCES "alunos"("matricula") ON DELETE CASCADE ON UPDATE CASCADE;

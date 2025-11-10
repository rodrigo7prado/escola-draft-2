-- AlterTable
ALTER TABLE "alunos" ADD COLUMN     "dadosOriginais" JSONB,
ADD COLUMN     "dataImportacaoTextoDadosEscolares" TIMESTAMP(3),
ADD COLUMN     "dataImportacaoTextoDadosPessoais" TIMESTAMP(3),
ADD COLUMN     "textoBrutoDadosEscolares" TEXT,
ADD COLUMN     "textoBrutoDadosPessoais" TEXT;

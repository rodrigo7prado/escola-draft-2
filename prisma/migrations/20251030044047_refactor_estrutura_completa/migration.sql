-- ============================================================================
-- MIGRATION: Refatoração completa da estrutura
-- ============================================================================
-- Esta migration:
-- 1. Cria as novas tabelas (arquivos_importados, linhas_importadas, alunos, auditoria)
-- 2. Migra dados de UploadedFile para a nova estrutura
-- 3. Remove as tabelas antigas (UploadedFile, AlunoEdit)
-- ============================================================================

-- ============================================================================
-- PASSO 1: Criar novas tabelas
-- ============================================================================

-- Tabela: arquivos_importados
CREATE TABLE "arquivos_importados" (
    "id" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataDownload" TIMESTAMP(3),
    "dataUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hashArquivo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "excluidoEm" TIMESTAMP(3),
    "excluidoPor" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arquivos_importados_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "arquivos_importados_hashArquivo_key" ON "arquivos_importados"("hashArquivo");
CREATE INDEX "arquivos_importados_hashArquivo_idx" ON "arquivos_importados"("hashArquivo");
CREATE INDEX "arquivos_importados_dataUpload_idx" ON "arquivos_importados"("dataUpload");
CREATE INDEX "arquivos_importados_status_idx" ON "arquivos_importados"("status");

-- Tabela: linhas_importadas
CREATE TABLE "linhas_importadas" (
    "id" TEXT NOT NULL,
    "arquivoId" TEXT NOT NULL,
    "numeroLinha" INTEGER NOT NULL,
    "dadosOriginais" JSONB NOT NULL,
    "identificadorChave" TEXT,
    "tipoEntidade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linhas_importadas_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "linhas_importadas_arquivoId_idx" ON "linhas_importadas"("arquivoId");
CREATE INDEX "linhas_importadas_identificadorChave_idx" ON "linhas_importadas"("identificadorChave");
CREATE INDEX "linhas_importadas_tipoEntidade_idx" ON "linhas_importadas"("tipoEntidade");

-- Tabela: alunos
CREATE TABLE "alunos" (
    "id" TEXT NOT NULL,
    "matricula" VARCHAR(15) NOT NULL,
    "nome" VARCHAR(200),
    "sexo" VARCHAR(1),
    "dataNascimento" DATE,
    "nacionalidade" VARCHAR(50),
    "naturalidade" VARCHAR(100),
    "uf" VARCHAR(2),
    "rg" VARCHAR(20),
    "rgOrgaoEmissor" VARCHAR(20),
    "rgDataEmissao" DATE,
    "cpf" VARCHAR(14),
    "nomeMae" VARCHAR(200),
    "nomePai" VARCHAR(200),
    "dataConclusaoEnsinoMedio" DATE,
    "efInstituicao" VARCHAR(200),
    "efMunicipioEstado" VARCHAR(100),
    "efAnoConclusao" INTEGER,
    "efNumeroPagina" VARCHAR(20),
    "efDataEmissao" DATE,
    "dadosConferidos" BOOLEAN NOT NULL DEFAULT false,
    "conferidoEm" TIMESTAMP(3),
    "conferidoPor" TEXT,
    "certificacao" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" VARCHAR(1000),
    "origemTipo" TEXT NOT NULL,
    "linhaOrigemId" TEXT,
    "fonteAusente" BOOLEAN NOT NULL DEFAULT false,
    "fonteAusenteCiente" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoPor" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "atualizadoPor" TEXT,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "alunos_matricula_key" ON "alunos"("matricula");
CREATE INDEX "alunos_matricula_idx" ON "alunos"("matricula");
CREATE INDEX "alunos_nome_idx" ON "alunos"("nome");
CREATE INDEX "alunos_origemTipo_idx" ON "alunos"("origemTipo");
CREATE INDEX "alunos_fonteAusente_idx" ON "alunos"("fonteAusente");

-- Tabela: auditoria
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL,
    "tabela" VARCHAR(50) NOT NULL,
    "registroId" TEXT NOT NULL,
    "operacao" VARCHAR(10) NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "camposAlterados" TEXT[],
    "usuarioId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "auditoria_tabela_registroId_idx" ON "auditoria"("tabela", "registroId");
CREATE INDEX "auditoria_timestamp_idx" ON "auditoria"("timestamp");
CREATE INDEX "auditoria_usuarioId_idx" ON "auditoria"("usuarioId");

-- ============================================================================
-- PASSO 2: Adicionar foreign keys
-- ============================================================================

ALTER TABLE "linhas_importadas" ADD CONSTRAINT "linhas_importadas_arquivoId_fkey"
    FOREIGN KEY ("arquivoId") REFERENCES "arquivos_importados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "alunos" ADD CONSTRAINT "alunos_linhaOrigemId_fkey"
    FOREIGN KEY ("linhaOrigemId") REFERENCES "linhas_importadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- PASSO 3: Migrar dados de UploadedFile para nova estrutura
-- ============================================================================

-- 3.1: Migrar UploadedFile → arquivos_importados
INSERT INTO "arquivos_importados" (
    "id",
    "nomeArquivo",
    "tipo",
    "dataDownload",
    "dataUpload",
    "hashArquivo",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "fileName",
    'alunos', -- Assumindo que todos são do tipo 'alunos'
    NULL, -- dataDownload não existe na tabela antiga
    "uploadDate",
    "dataHash",
    'ativo',
    "createdAt",
    "updatedAt"
FROM "UploadedFile";

-- 3.2: Migrar rows do JSONB para linhas_importadas
-- Esta parte é mais complexa porque precisa "explodir" o array de rows
INSERT INTO "linhas_importadas" (
    "id",
    "arquivoId",
    "numeroLinha",
    "dadosOriginais",
    "identificadorChave",
    "tipoEntidade",
    "createdAt"
)
SELECT
    gen_random_uuid()::text,
    uf."id",
    row_number() OVER (PARTITION BY uf."id" ORDER BY (SELECT NULL)) - 1,
    row_data,
    row_data->>'ALUNO', -- Matrícula do aluno
    'aluno',
    uf."createdAt"
FROM "UploadedFile" uf,
LATERAL jsonb_array_elements(uf."data"->'rows') AS row_data;

-- ============================================================================
-- PASSO 4: Criar função e trigger para auditoria automática
-- ============================================================================

-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION fn_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    campos_alterados text[];
    col text;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- Detecta quais campos foram alterados
        SELECT array_agg(key)
        INTO campos_alterados
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
          AND key NOT IN ('atualizadoEm', 'updatedAt'); -- Ignora campos de timestamp

        INSERT INTO "auditoria" (
            "id",
            "tabela",
            "registroId",
            "operacao",
            "dadosAntes",
            "dadosDepois",
            "camposAlterados",
            "usuarioId"
        )
        VALUES (
            gen_random_uuid()::text,
            TG_TABLE_NAME,
            NEW."id",
            'UPDATE',
            to_jsonb(OLD),
            to_jsonb(NEW),
            campos_alterados,
            COALESCE(NEW."atualizadoPor", NEW."editadoPor")
        );
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO "auditoria" (
            "id",
            "tabela",
            "registroId",
            "operacao",
            "dadosDepois",
            "usuarioId"
        )
        VALUES (
            gen_random_uuid()::text,
            TG_TABLE_NAME,
            NEW."id",
            'INSERT',
            to_jsonb(NEW),
            COALESCE(NEW."criadoPor", NEW."editadoPor")
        );
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO "auditoria" (
            "id",
            "tabela",
            "registroId",
            "operacao",
            "dadosAntes"
        )
        VALUES (
            gen_random_uuid()::text,
            TG_TABLE_NAME,
            OLD."id",
            'DELETE',
            to_jsonb(OLD)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para tabela alunos
CREATE TRIGGER trg_auditoria_alunos
    AFTER INSERT OR UPDATE OR DELETE ON "alunos"
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria();

-- ============================================================================
-- PASSO 5: Criar função para marcar fonte ausente quando arquivo é excluído
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_marcar_fonte_ausente()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW."status" = 'excluido' AND OLD."status" != 'excluido') THEN
        -- Marca todos os alunos originados deste arquivo como fonte ausente
        UPDATE "alunos"
        SET "fonteAusente" = true
        WHERE "linhaOrigemId" IN (
            SELECT "id" FROM "linhas_importadas" WHERE "arquivoId" = NEW."id"
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_arquivo_excluido
    AFTER UPDATE ON "arquivos_importados"
    FOR EACH ROW EXECUTE FUNCTION fn_marcar_fonte_ausente();

-- ============================================================================
-- PASSO 6: Remover tabelas antigas
-- ============================================================================

DROP TABLE IF EXISTS "AlunoEdit";
DROP TABLE IF EXISTS "UploadedFile";

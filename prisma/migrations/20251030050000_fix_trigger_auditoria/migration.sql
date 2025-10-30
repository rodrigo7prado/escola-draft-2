-- Corrige a função de auditoria para não referenciar campos inexistentes

CREATE OR REPLACE FUNCTION fn_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    campos_alterados text[];
    col text;
    usuario_id_value text;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- Detecta quais campos foram alterados
        SELECT array_agg(key)
        INTO campos_alterados
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
          AND key NOT IN ('atualizadoEm', 'updatedAt');

        -- Tenta pegar usuarioId de diferentes campos possíveis
        usuario_id_value := COALESCE(
            NEW."atualizadoPor",
            OLD."atualizadoPor",
            NEW."criadoPor"
        );

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
            usuario_id_value
        );
    ELSIF (TG_OP = 'INSERT') THEN
        -- Tenta pegar usuarioId
        usuario_id_value := NEW."criadoPor";

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
            usuario_id_value
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

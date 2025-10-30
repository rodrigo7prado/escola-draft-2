-- Remove tabelas antigas que não são mais usadas

-- Verificar se as tabelas antigas ainda existem e dropá-las
DROP TABLE IF EXISTS "AlunoEdit" CASCADE;
DROP TABLE IF EXISTS "UploadedFile" CASCADE;

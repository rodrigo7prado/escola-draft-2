import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export function validateFields(profile: ImportProfile) {
  if (!profile.fields || profile.fields.length === 0) return;
  const errors: string[] = [];
  const fields = profile.fields; // Type narrowing: agora sabemos que não é undefined

  fields.forEach((field, idx) => {
    const header = field.source.header || field.source.headers?.[0];
    if (!header) {
      errors.push(`fields[${idx}] (${field.name}): header/header[0] ausente`);
    }
    if (!field.roles || field.roles.length === 0) {
      errors.push(`fields[${idx}] (${field.name}): roles vazio`);
    }
    if (!field.persist) {
      errors.push(`fields[${idx}] (${field.name}): persist ausente`);
    }
  });

  if (profile.formato === "CSV") {
    const hasKey = fields.some((f) => f.roles.includes("key"));
    if (!hasKey) errors.push("fields: role=key ausente");
    const requiredContexts = ["anoLetivo", "turma", "modalidade", "serie"];
    requiredContexts.forEach((name) => {
      const found = fields.some((f) => f.roles.includes("context") && f.name === name);
      if (!found) errors.push(`fields: contexto obrigatorio ausente (${name})`);
    });
    const allowedSources = ["enturmacoes-por-turma", "none"];
    if (profile.summaryDeleteKeysSource && !allowedSources.includes(profile.summaryDeleteKeysSource)) {
      errors.push(`summaryDeleteKeysSource inválido: ${profile.summaryDeleteKeysSource}`);
    }
  }

  if (errors.length) {
    throw new Error(`ImportProfile inválido (${profile.tipoArquivo}): ${errors.join("; ")}`);
  }
}

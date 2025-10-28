"use client";

import DropCsv from "@/components/DropCsv";
import { useEffect, useMemo, useState, startTransition } from "react";

const ATA_HEADERS = [
  "Ano",
  "CENSO",
  "MODALIDADE",
  "CURSO",
  "SERIE",
  "TURNO",
  "TURMA",
  "ALUNO",
  "NOME_COMPL",
  "DISCIPLINA1",
  "TOTAL_PONTOS",
  "FALTAS",
  "Textbox148",
  "SITUACAO_FINAL",
];

const REL_HEADERS = [
  "REGIONAL",
  "MUNIC_ESCOLA",
  "UA_ANTIGA",
  "CAMPO_NOVA_UA",
  "CENSO",
  "ESCOLA",
  "ALUNO",
  "NOME_COMPL1",
  "PRE_NOME_SOCIAL",
  "DT_NASC",
  "SEXO",
  "TIPO_SANGUINEO",
  "QT_FILHOS",
  "NECESSIDADE_ESPECIAL",
  "ETNIA",
  "EST_CIVIL",
  "PAIS_NASC",
  "NACIONALIDADE",
  "MUNICIPIO_NASC_COD",
  "MUNICIPIO_NASC",
  "CREDO",
  "NOME_MAE",
  "MAE_FALECIDA",
  "MAE_CPF",
  "MAE_TELEFONE",
  "NOME_PAI",
  "PAI_FALECIDO",
  "PAI_CPF",
  "PAI_TELEFONE",
  "RESPONSAVEL_LEGAL",
  "RESP_NOME_COMPL",
  "RESP_CPF",
  "RESP_FONE",
  "CEP",
  "ENDERECO",
  "END_NUM",
  "END_COMPL",
  "BAIRRO",
  "END_MUNICIPIO",
  "LOCALIZACAO_ZONA",
  "TELEFONE",
  "CELULAR",
  "E_MAIL",
  "CPF",
  "RG_TIPO",
  "RG_NUM",
  "COMPL_RG",
  "RG_UF",
  "RG_EMISSOR",
  "RG_DTEXP",
  "INEP",
  "NIS",
  "TIPO_CERTIDAO",
  "MODELO_CERTIDAO",
  "CERT_NASC_CARTORIO_UF",
  "MUNICIPIO_CART",
  "NOME_CARTORIO",
  "TERMO",
  "DATA_EMISSAO",
  "CERT_NASC_FOLHA",
  "CERT_NASC_LIVRO",
  "CERT_NUMERO_MATRICULA",
  "SIT_ALUNO",
  "ANO_INGRESSO",
  "Textbox142",
  "DATA_INCLUSAO",
  "Textbox146",
  "REDE_ENSINO_ORIGEM",
  "UNIDADE_ENSINO",
  "NOME_UNIDADE",
  "NIVEL_SEGMENTO",
  "MODALIDADE",
  "CURSO",
  "Textbox156",
  "TURNO",
  "SERIE_ANO_ESCOLAR",
  "RECEBE_ESC_OUTRO_ESPACO",
  "UTILIZA_TRANSPORTE",
  "Textbox158",
  "Textbox160",
  "CADASTRO_COMPLETO",
  "MUNICIPIO_BILHETAGEM",
  "DISTORCAO_IDADE_SERIE",
  "ATUALIZAR_DADOS_CADASTRAIS1",
];

export default function MigrateUploads() {
  const ATA_STORAGE_KEY = "migration_ata_resultados_finais";
  const REL_STORAGE_KEY = "migration_rel_acomp_enturmacao";

  const [ataData, setAtaData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);

  useEffect(() => {
    try {
      const rawAta = localStorage.getItem(ATA_STORAGE_KEY);
      if (rawAta) {
        const parsed = JSON.parse(rawAta);
        startTransition(() => setAtaData(parsed));
      }
    } catch {}
  }, []);

  type TurmaInfo = { turma: string; serie?: string; turno?: string };
  type SerieNode = { nome: string; turmas: TurmaInfo[]; registros: number };
  type ModalidadeNode = { nome: string; curso: string; series: Record<string, SerieNode>; registros: number };
  type AnoNode = { nome: string; modalidades: Record<string, ModalidadeNode>; registros: number };
  type Hierarquia = Record<string, AnoNode>;

  const formatSerie = (s: string) => {
    const n = parseInt(s, 10);
    if (!Number.isFinite(n)) return s || "(sem série)";
    return `${n}ª série`;
  };

  const pluralTurmas = (count: number) => `${count} ${count === 1 ? "turma" : "turmas"}`;

  const hierarquia = useMemo(() => {
    const root: Hierarquia = {};
    if (!ataData) return root;

    const stripLabelPrefix = (s: string) => {
      // Remove padrões como "Campo:" no início do valor
      // e também variantes com acentos (e.g., "Série:")
      const m = String(s || "").trim().match(/^\s*([\p{L}\s_]+):\s*(.*)$/u);
      return m ? m[2].trim() : String(s || "").trim();
    };

    const normalize = (s: string) => stripLabelPrefix(s)
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .toUpperCase().trim();

    for (const r of ataData.rows) {
      const cursoNorm = normalize(r["CURSO"] ?? "");
      if (cursoNorm !== "ENSINO MEDIO") continue;

      const ano = stripLabelPrefix(r["Ano"] ?? "") || "(sem ano)";
      const modalidade = stripLabelPrefix(r["MODALIDADE"] ?? "") || "(sem modalidade)";
      const turma = stripLabelPrefix(r["TURMA"] ?? "");
      const serieRaw = stripLabelPrefix(r["SERIE"] ?? "");
      const serie = serieRaw || "(sem série)";
      const turno = stripLabelPrefix(r["TURNO"] ?? "");
      if (!turma) continue;

      if (!root[ano]) root[ano] = { nome: ano, modalidades: {}, registros: 0 };
      const nAno = root[ano];
      if (!nAno.modalidades[modalidade]) nAno.modalidades[modalidade] = { nome: modalidade, curso: "Ensino Médio", series: {}, registros: 0 };
      const nMod = nAno.modalidades[modalidade];
      if (!nMod.series[serie]) nMod.series[serie] = { nome: serie, turmas: [], registros: 0 };
      const nSerie = nMod.series[serie];

      if (!nSerie.turmas.some((t) => t.turma === turma)) {
        nSerie.turmas.push({ turma, serie, turno });
      }
      nAno.registros += 1;
      nMod.registros += 1;
      nSerie.registros += 1;
    }

    for (const ano of Object.keys(root)) {
      const modalidades = root[ano].modalidades;
      for (const mod of Object.keys(modalidades)) {
        const series = modalidades[mod].series;
        for (const s of Object.keys(series)) {
          series[s].turmas.sort((a, b) => a.turma.localeCompare(b.turma));
        }
      }
    }

    return root;
  }, [ataData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <DropCsv
          title="Ata_resultados_finais.csv"
          requiredHeaders={ATA_HEADERS}
          duplicateKey="ALUNO"
          onParsed={(d) => {
            setAtaData(d);
            try { localStorage.setItem(ATA_STORAGE_KEY, JSON.stringify(d)); } catch {}
          }}
          showPreview={false}
        />
        <div className="text-xs text-neutral-700 border rounded-md p-3">
          {Object.keys(hierarquia).length === 0 ? (
            <div>Nenhum upload válido de Ata_resultados_finais.csv realizado ainda.</div>
          ) : (
            <div className="space-y-2">
              {Object.keys(hierarquia).sort().map((ano) => {
                const nAno = hierarquia[ano];
                const totalTurmasAno = Object.values(nAno.modalidades).reduce((acc, m) => acc + Object.values(m.series).reduce((a, s) => a + s.turmas.length, 0), 0);
                return (
                  <details key={ano} className="group">
                    <summary className="px-3 py-2 cursor-pointer select-none font-medium flex items-center justify-between hover:bg-neutral-50 rounded">
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 origin-center transition-transform group-open:rotate-90 text-neutral-600">
                          {/* caret right */}
                          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M7 5l6 5-6 5V5z"/></svg>
                        </span>
                        <span>Ano letivo: {ano}</span>
                      </span>
                      <span className="flex items-center gap-2 text-xs text-neutral-600">
                        <span className="inline-flex items-center gap-1 border rounded px-1.5 py-0.5">{pluralTurmas(totalTurmasAno)}</span>
                      </span>
                    </summary>
                    <div className="px-3 pb-2 space-y-2">
                      {/* Resumo por modalidade (chips) */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {Object.keys(nAno.modalidades).sort().map((mod) => {
                          const nMod = nAno.modalidades[mod];
                          const totalTurmasMod = Object.values(nMod.series).reduce((a, s) => a + s.turmas.length, 0);
                          return (
                            <span key={mod} className="inline-flex items-center gap-1 border rounded px-2 py-1">
                              <span>{mod}</span>
                              <span className="text-neutral-600">{pluralTurmas(totalTurmasMod)}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Modalidades expandíveis */}
                      {Object.keys(nAno.modalidades).sort().map((mod) => {
                        const nMod = nAno.modalidades[mod];
                        const series = nMod.series;
                        const serieChips = Object.keys(series).sort().map((s) => {
                          const total = series[s].turmas.length;
                          return `${formatSerie(s)}: ${total}`;
                        }).join(" • ");

                        return (
                          <details key={mod} className="group">
                            <summary className="px-3 py-2 cursor-pointer select-none flex items-center justify-between hover:bg-neutral-50 rounded">
                              <span className="flex items-center gap-2">
                                <span className="inline-block w-3 h-3 origin-center transition-transform group-open:rotate-90 text-neutral-600">
                                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M7 5l6 5-6 5V5z"/></svg>
                                </span>
                                <span>Modalidade: {nMod.nome} — Curso: {nMod.curso}</span>
                              </span>
                              <span className="text-xs text-neutral-600">{serieChips}</span>
                            </summary>
                            <div className="px-3 pb-2 space-y-2">
                              {Object.keys(series).sort().map((s) => (
                                <div key={s} className="rounded">
                                  <div className="px-3 py-2 text-sm font-medium flex items-center justify-between bg-neutral-50 rounded">
                                    <span>{formatSerie(s)}</span>
                                    <span className="text-xs text-neutral-600">{pluralTurmas(series[s].turmas.length)}</span>
                                  </div>
                                  <div className="px-3 pb-2">
                                    <ul className="text-sm divide-y">
                                      {series[s].turmas.map((t) => (
                                        <li key={t.turma} className="px-2 py-1 flex items-center justify-between">
                                          <span className="font-medium">{t.turma}</span>
                                          <span className="text-xs text-neutral-600">{t.turno || ""}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <DropCsv
          title="RelAcompEnturmacaoPorEscola.csv"
          requiredHeaders={REL_HEADERS}
          duplicateKey="ALUNO"
          showPreview={false}
          onParsed={(d) => { try { localStorage.setItem(REL_STORAGE_KEY, JSON.stringify(d)); } catch {} }}
        />
        <div className="mt-2">
          <button
            type="button"
            className="border rounded px-2 py-1 text-[11px] hover:bg-neutral-50"
            onClick={() => { try { localStorage.removeItem(REL_STORAGE_KEY); } catch {} }}
          >
            Limpar dados salvos (Rel)
          </button>
        </div>
      </div>
    </div>
  );
}



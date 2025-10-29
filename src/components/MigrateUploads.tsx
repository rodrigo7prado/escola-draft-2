"use client";

import DropCsv from "@/components/DropCsv";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
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
  type Registro = { ano: string; modalidade: string; turma: string; serie: string; turno: string };

  const pluralTurmas = (count: number) => `${count} ${count === 1 ? "turma" : "turmas"}`;

  const estrutura = useMemo(() => {
    if (!ataData) {
      return new Map<string, Map<string, Map<string, TurmaInfo>>>();
    }

    const stripLabelPrefix = (s: string) => {
      const m = String(s || "").trim().match(/^\s*([\p{L}\s_]+):\s*(.*)$/u);
      return m ? m[2].trim() : String(s || "").trim();
    };

    const normalize = (s: string) => stripLabelPrefix(s)
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .toUpperCase().trim();

    const registros: Registro[] = [];

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

      // Alerta se encontrar série com valor 0
      const serieNum = parseInt(serie, 10);
      if (serieNum === 0) {
        console.warn(`Encontrada SERIE com valor 0 para turma ${turma} no ano ${ano}`);
      }

      registros.push({ ano, modalidade, turma, serie, turno });
    }

    // Estrutura: Período Letivo -> Modalidade -> Turmas
    const estrutura = new Map<string, Map<string, Map<string, TurmaInfo>>>();

    for (const reg of registros) {
      if (!estrutura.has(reg.ano)) estrutura.set(reg.ano, new Map());
      const periodoMap = estrutura.get(reg.ano)!;

      if (!periodoMap.has(reg.modalidade)) periodoMap.set(reg.modalidade, new Map());
      const modMap = periodoMap.get(reg.modalidade)!;

      modMap.set(reg.turma, { turma: reg.turma, serie: reg.serie, turno: reg.turno });
    }

    return estrutura;
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
          {!ataData ? (
            <div>Nenhum upload válido de Ata_resultados_finais.csv realizado ainda.</div>
          ) : estrutura.size === 0 ? (
            <div className="text-xs text-neutral-500 py-3">Nenhum dado de Ensino Médio encontrado.</div>
          ) : (
            <Tabs defaultValue={Array.from(estrutura.keys()).sort()[0]} variant="default">
              <TabsList variant="default">
                {Array.from(estrutura.keys()).sort().map((periodoLetivo) => (
                  <TabsTrigger key={periodoLetivo} value={periodoLetivo} variant="default">
                    {periodoLetivo}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Array.from(estrutura.entries()).sort().map(([periodoLetivo, modMap]) => (
                <TabsContent key={periodoLetivo} value={periodoLetivo}>
                  <Tabs defaultValue={Array.from(modMap.keys()).sort()[0]} variant="tertiary">
                    <TabsList variant="tertiary">
                      {Array.from(modMap.keys()).sort().map((mod) => (
                        <TabsTrigger key={mod} value={mod} variant="tertiary">{mod}</TabsTrigger>
                      ))}
                    </TabsList>
                    {Array.from(modMap.entries()).sort().map(([mod, turmasMap]) => (
                      <TabsContent key={mod} value={mod}>
                        <div className="pt-2">
                          <div className="text-xs text-neutral-600 mb-2">Total: {pluralTurmas(turmasMap.size)}</div>
                          <ul className="divide-y max-h-60 overflow-auto border rounded">
                            {Array.from(turmasMap.keys()).sort().map((turma) => (
                              <li key={turma} className="py-1.5 px-2 text-xs hover:bg-neutral-50">
                                {turma}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </TabsContent>
              ))}
            </Tabs>
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



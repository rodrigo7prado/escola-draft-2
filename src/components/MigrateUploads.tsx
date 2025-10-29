"use client";

import DropCsv from "@/components/DropCsv";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { useEffect, useMemo, useState, startTransition } from "react";

type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

type UploadedFile = {
  id: string; // timestamp
  fileName: string;
  uploadDate: string;
  data: ParsedCsv;
  dataHash: string;
};

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

// Função para calcular hash dos dados processados
async function hashData(data: ParsedCsv): Promise<string> {
  const sortedRows = [...data.rows].sort((a, b) => {
    const keyA = Object.keys(a).map(k => `${k}:${a[k]}`).join('|');
    const keyB = Object.keys(b).map(k => `${k}:${b[k]}`).join('|');
    return keyA.localeCompare(keyB);
  });
  const str = JSON.stringify({ headers: data.headers.sort(), rows: sortedRows });
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function MigrateUploads() {
  const ATA_STORAGE_KEY = "migration_ata_files";
  const REL_STORAGE_KEY = "migration_rel_acomp_enturmacao";

  const [ataFiles, setAtaFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    try {
      const rawAta = localStorage.getItem(ATA_STORAGE_KEY);
      if (rawAta) {
        const parsed = JSON.parse(rawAta) as UploadedFile[];
        startTransition(() => setAtaFiles(parsed));
      }
    } catch {}
  }, []);

  type TurmaInfo = { turma: string; prefixo: string; parteNumerica: string; serie?: string; turno?: string };
  type Registro = { ano: string; modalidade: string; turma: string; serie: string; turno: string };

  const pluralTurmas = (count: number) => `${count} ${count === 1 ? "turma" : "turmas"}`;

  // Função para ordenar turmas pela parte numérica
  const ordenarTurmas = (turmas: Map<string, TurmaInfo>): [string, TurmaInfo][] => {
    return Array.from(turmas.entries()).sort((a, b) => {
      const numA = a[1].parteNumerica;
      const numB = b[1].parteNumerica;
      return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  // Handler para adicionar novos arquivos
  const handleNewFiles = async (data: ParsedCsv, fileName: string) => {
    const hash = await hashData(data);

    // Usar callback funcional para pegar o estado mais recente
    setAtaFiles(currentFiles => {
      // Verificar se já existe arquivo com o mesmo hash
      if (currentFiles.some(f => f.dataHash === hash)) {
        console.warn(`Arquivo "${fileName}" com conteúdo idêntico já foi carregado. Upload ignorado.`);
        return currentFiles; // Retorna estado atual sem modificar
      }

      const newFile: UploadedFile = {
        id: crypto.randomUUID(), // ID único
        fileName,
        uploadDate: new Date().toISOString(),
        data,
        dataHash: hash
      };

      const updatedFiles = [...currentFiles, newFile];

      try {
        localStorage.setItem(ATA_STORAGE_KEY, JSON.stringify(updatedFiles));
      } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
      }

      return updatedFiles;
    });
  };

  // Handler para remover arquivo individual
  const removeFile = (fileId: string) => {
    const updatedFiles = ataFiles.filter(f => f.id !== fileId);
    setAtaFiles(updatedFiles);
    try {
      localStorage.setItem(ATA_STORAGE_KEY, JSON.stringify(updatedFiles));
    } catch {}
  };

  // Handler para remover por período letivo
  const removeByPeriodo = (periodo: string) => {
    if (!confirm(`Tem certeza que deseja remover todos os dados do período ${periodo}?`)) return;

    const updatedFiles = ataFiles.filter(file => {
      // Verificar se o arquivo contém dados deste período
      const hasPeriodo = file.data.rows.some(row => {
        const stripLabelPrefix = (s: string) => {
          const m = String(s || "").trim().match(/^\s*([\p{L}\s_]+):\s*(.*)$/u);
          return m ? m[2].trim() : String(s || "").trim();
        };
        const ano = stripLabelPrefix(row["Ano"] ?? "");
        return ano === periodo;
      });
      return !hasPeriodo;
    });

    setAtaFiles(updatedFiles);
    try {
      localStorage.setItem(ATA_STORAGE_KEY, JSON.stringify(updatedFiles));
    } catch {}
  };

  // Handler para remover por modalidade
  const removeByModalidade = (modalidade: string, periodo: string) => {
    if (!confirm(`Tem certeza que deseja remover todos os dados da modalidade "${modalidade}" do período ${periodo}?`)) return;

    const updatedFiles = ataFiles.filter(file => {
      // Verificar se o arquivo contém dados desta modalidade e período
      const hasMatch = file.data.rows.some(row => {
        const stripLabelPrefix = (s: string) => {
          const m = String(s || "").trim().match(/^\s*([\p{L}\s_]+):\s*(.*)$/u);
          return m ? m[2].trim() : String(s || "").trim();
        };
        const ano = stripLabelPrefix(row["Ano"] ?? "");
        const mod = stripLabelPrefix(row["MODALIDADE"] ?? "");
        return ano === periodo && mod === modalidade;
      });
      return !hasMatch;
    });

    setAtaFiles(updatedFiles);
    try {
      localStorage.setItem(ATA_STORAGE_KEY, JSON.stringify(updatedFiles));
    } catch {}
  };

  // Handler para limpar todos os arquivos
  const clearAllFiles = () => {
    if (confirm('Tem certeza que deseja remover todos os arquivos carregados?')) {
      setAtaFiles([]);
      try {
        localStorage.removeItem(ATA_STORAGE_KEY);
      } catch {}
    }
  };

  const estrutura = useMemo(() => {
    if (ataFiles.length === 0) {
      return new Map<string, Map<string, Map<string, TurmaInfo>>>();
    }

    const stripLabelPrefix = (s: string) => {
      const m = String(s || "").trim().match(/^\s*([\p{L}\s_]+):\s*(.*)$/u);
      return m ? m[2].trim() : String(s || "").trim();
    };

    const normalize = (s: string) => stripLabelPrefix(s)
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .toUpperCase().trim();

    const extrairPartesTurma = (turma: string): { prefixo: string; parteNumerica: string } => {
      // Procura pela primeira sequência de dígitos
      const match = turma.match(/^([^\d]*)(\d.*)$/);
      if (match) {
        return {
          prefixo: match[1],
          parteNumerica: match[2]
        };
      }
      // Se não encontrar dígitos, considera tudo como numérico
      return {
        prefixo: "",
        parteNumerica: turma
      };
    };

    const registros: Registro[] = [];

    // Processar todos os arquivos carregados
    for (const file of ataFiles) {
      for (const r of file.data.rows) {
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
          console.warn(`Encontrada SERIE com valor 0 para turma ${turma} no ano ${ano} (arquivo: ${file.fileName})`);
        }

        registros.push({ ano, modalidade, turma, serie, turno });
      }
    }

    // Estrutura: Período Letivo -> Modalidade -> Turmas
    const estrutura = new Map<string, Map<string, Map<string, TurmaInfo>>>();

    for (const reg of registros) {
      if (!estrutura.has(reg.ano)) estrutura.set(reg.ano, new Map());
      const periodoMap = estrutura.get(reg.ano)!;

      if (!periodoMap.has(reg.modalidade)) periodoMap.set(reg.modalidade, new Map());
      const modMap = periodoMap.get(reg.modalidade)!;

      const { prefixo, parteNumerica } = extrairPartesTurma(reg.turma);
      modMap.set(reg.turma, {
        turma: reg.turma,
        prefixo,
        parteNumerica,
        serie: reg.serie,
        turno: reg.turno
      });
    }

    return estrutura;
  }, [ataFiles]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <DropCsv
          title="Ata de Resultados Finais"
          requiredHeaders={ATA_HEADERS}
          duplicateKey="ALUNO"
          onParsed={handleNewFiles}
          showPreview={false}
          multiple={true}
        />

        {/* Lista de arquivos carregados */}
        {ataFiles.length > 0 && (
          <div className="border rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium">
                Arquivos carregados ({ataFiles.length})
              </div>
              <button
                onClick={clearAllFiles}
                className="text-[10px] text-red-600 hover:underline"
                type="button"
              >
                Limpar todos
              </button>
            </div>
            <ul className="space-y-1.5 max-h-40 overflow-auto">
              {ataFiles.map((file) => (
                <li key={file.id} className="flex items-center justify-between text-xs border-b pb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.fileName}</div>
                    <div className="text-[10px] text-neutral-500">
                      {new Date(file.uploadDate).toLocaleString('pt-BR')} • {file.data.rows.length} registros
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="ml-2 text-red-600 hover:bg-red-50 rounded px-1.5 py-0.5 text-[10px]"
                    type="button"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="text-xs text-neutral-700 border rounded-md p-3">
          {ataFiles.length === 0 ? (
            <div>Nenhum arquivo carregado ainda.</div>
          ) : estrutura.size === 0 ? (
            <div className="text-xs text-neutral-500 py-3">Nenhum dado encontrado nos arquivos carregados.</div>
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
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs text-neutral-600">
                      Modalidades: {modMap.size}
                    </div>
                    <button
                      onClick={() => removeByPeriodo(periodoLetivo)}
                      className="text-[10px] text-red-600 hover:underline"
                      type="button"
                    >
                      Excluir período
                    </button>
                  </div>
                  <Tabs defaultValue={Array.from(modMap.keys()).sort()[0]} variant="tertiary">
                    <TabsList variant="tertiary">
                      {Array.from(modMap.keys()).sort().map((mod) => (
                        <TabsTrigger key={mod} value={mod} variant="tertiary">{mod}</TabsTrigger>
                      ))}
                    </TabsList>
                    {Array.from(modMap.entries()).sort().map(([mod, turmasMap]) => (
                      <TabsContent key={mod} value={mod}>
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-neutral-600">Total: {pluralTurmas(turmasMap.size)}</div>
                            <button
                              onClick={() => removeByModalidade(mod, periodoLetivo)}
                              className="text-[10px] text-red-600 hover:underline"
                              type="button"
                            >
                              Excluir modalidade
                            </button>
                          </div>
                          <ul className="divide-y max-h-60 overflow-auto border rounded">
                            {ordenarTurmas(turmasMap).map(([turma, info]) => (
                              <li key={turma} className="py-1.5 px-2 text-xs hover:bg-neutral-50">
                                {info.prefixo && <span className="text-neutral-500">{info.prefixo}</span>}
                                <span>{info.parteNumerica}</span>
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
          title="Relatório de Acompanhamento de Enturmação"
          requiredHeaders={REL_HEADERS}
          duplicateKey="ALUNO"
          showPreview={false}
          onParsed={(d, fileName) => {
            try {
              localStorage.setItem(REL_STORAGE_KEY, JSON.stringify({ data: d, fileName, uploadDate: new Date().toISOString() }));
            } catch {}
          }}
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



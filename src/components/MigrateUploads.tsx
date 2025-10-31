"use client";

import DropCsv from "@/components/DropCsv";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState, startTransition } from "react";

type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

type UploadedFile = {
  id: string;
  fileName: string;
  uploadDate: string;
  data: ParsedCsv;
  dataHash: string;
  rowCount: number;
  anos: string[];
  modalidades: string[];
  turmas: string[];
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

export default function MigrateUploads() {
  const [ataFiles, setAtaFiles] = useState<UploadedFile[]>([]);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  // Carregar arquivos da API ao montar o componente
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files');
        if (!response.ok) throw new Error('Erro ao carregar arquivos');
        const { arquivos } = await response.json();

        // Adaptar estrutura nova para antiga temporariamente
        const arquivosAdaptados = arquivos.map((arq: any) => ({
          id: arq.id,
          fileName: arq.nomeArquivo,
          uploadDate: arq.dataUpload,
          dataHash: arq.hashArquivo,
          rowCount: arq._count?.linhas || 0,
          anos: [],
          modalidades: [],
          turmas: [],
          data: { headers: [], rows: [] }
        }));

        startTransition(() => setAtaFiles(arquivosAdaptados));
      } catch (error) {
        console.error('Erro ao carregar arquivos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
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
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, fileName })
      });

      if (response.status === 409) {
        // Arquivo duplicado
        const { fileId } = await response.json();
        console.warn(`Arquivo "${fileName}" com conteúdo idêntico já existe (ID: ${fileId}). Upload ignorado.`);
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      const { arquivo } = await response.json();

      // Adaptar estrutura nova para antiga
      const arquivoAdaptado = {
        id: arquivo.id,
        fileName: arquivo.nomeArquivo,
        uploadDate: arquivo.dataUpload,
        dataHash: arquivo.hashArquivo,
        rowCount: 0,
        anos: [],
        modalidades: [],
        turmas: [],
        data: { headers: [], rows: [] }
      };

      setAtaFiles(currentFiles => [...currentFiles, arquivoAdaptado]);

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do arquivo. Verifique o console para mais detalhes.');
    }
  };

  // Handler para remover arquivo individual
  const removeFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar arquivo');
      }

      setAtaFiles(currentFiles => currentFiles.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      alert('Erro ao deletar arquivo. Verifique o console para mais detalhes.');
    }
  };

  // Handler para remover por período letivo
  const removeByPeriodo = async (periodo: string) => {
    if (!confirm(`Tem certeza que deseja remover todos os dados do período ${periodo}?`)) return;

    try {
      const response = await fetch(`/api/files?periodo=${encodeURIComponent(periodo)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar arquivos do período');
      }

      // Remover os arquivos do estado local que correspondem a este período
      setAtaFiles(currentFiles =>
        currentFiles.filter(file => !file.anos.includes(periodo))
      );
    } catch (error) {
      console.error('Erro ao deletar período:', error);
      alert('Erro ao deletar período. Verifique o console para mais detalhes.');
    }
  };

  // Handler para remover por modalidade
  const removeByModalidade = async (modalidade: string, periodo: string) => {
    if (!confirm(`Tem certeza que deseja remover todos os dados da modalidade "${modalidade}" do período ${periodo}?`)) return;

    try {
      const response = await fetch(
        `/api/files?periodo=${encodeURIComponent(periodo)}&modalidade=${encodeURIComponent(modalidade)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Erro ao deletar arquivos da modalidade');
      }

      // Remover os arquivos do estado local que correspondem a este período e modalidade
      setAtaFiles(currentFiles =>
        currentFiles.filter(file =>
          !(file.anos.includes(periodo) && file.modalidades.includes(modalidade))
        )
      );
    } catch (error) {
      console.error('Erro ao deletar modalidade:', error);
      alert('Erro ao deletar modalidade. Verifique o console para mais detalhes.');
    }
  };

  // Handler para limpar todos os arquivos
  const clearAllFiles = async () => {
    if (!confirm('Tem certeza que deseja remover todos os arquivos carregados?')) return;

    try {
      // Deletar todos os arquivos
      const deletePromises = ataFiles.map(file =>
        fetch(`/api/files?id=${file.id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      setAtaFiles([]);
    } catch (error) {
      console.error('Erro ao limpar arquivos:', error);
      alert('Erro ao limpar arquivos. Verifique o console para mais detalhes.');
    }
  };

  // Ordenar arquivos conforme seleção
  const sortedFiles = useMemo(() => {
    const files = [...ataFiles];
    if (sortBy === 'name') {
      // Ordenação natural/alfanumérica
      return files.sort((a, b) =>
        a.fileName.localeCompare(b.fileName, undefined, {
          numeric: true,
          sensitivity: 'base'
        })
      );
    } else {
      return files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }
  }, [ataFiles, sortBy]);

  const estrutura = useMemo(() => {
    if (ataFiles.length === 0) {
      return new Map<string, Map<string, Map<string, TurmaInfo>>>();
    }

    const stripLabelPrefix = (s: string) => {
      const m = String(s || "").trim().match(/^\s*([\p{L}\s_]+):\s*(.*)$/u);
      return m ? m[2].trim() : String(s || "").trim();
    };

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
    <div className="space-y-2">
        <DropCsv
          title="Ata de Resultados Finais"
          requiredHeaders={ATA_HEADERS}
          duplicateKey="ALUNO"
          onParsed={handleNewFiles}
          showPreview={false}
          multiple={true}
        />

        {/* Resumo de arquivos carregados */}
        {ataFiles.length > 0 && (
          <Button
            onClick={() => setShowFilesModal(true)}
            variant="ghost"
            className="w-full border rounded-sm p-3 text-left hover:bg-neutral-50 transition-colors h-auto justify-start"
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="text-xs font-medium text-neutral-900">
                  {ataFiles.length} {ataFiles.length === 1 ? 'arquivo carregado' : 'arquivos carregados'}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {ataFiles.reduce((sum, f) => sum + f.rowCount, 0)} registros totais
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                Clique para ver detalhes →
              </div>
            </div>
          </Button>
        )}

        {/* Modal com lista completa de arquivos */}
        <Modal
          open={showFilesModal}
          onClose={() => setShowFilesModal(false)}
          title="Arquivos Carregados"
          size="lg"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="text-sm text-neutral-600">
                Total: {ataFiles.length} {ataFiles.length === 1 ? 'arquivo' : 'arquivos'}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500">Ordenar:</span>
                  <Button
                    onClick={() => setSortBy('name')}
                    variant={sortBy === 'name' ? 'primary' : 'ghost'}
                    size="sm"
                    className={sortBy === 'name' ? 'bg-blue-100 text-blue-700' : ''}
                  >
                    Nome
                  </Button>
                  <Button
                    onClick={() => setSortBy('date')}
                    variant={sortBy === 'date' ? 'primary' : 'ghost'}
                    size="sm"
                    className={sortBy === 'date' ? 'bg-blue-100 text-blue-700' : ''}
                  >
                    Data
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    clearAllFiles();
                    setShowFilesModal(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:underline"
                >
                  Limpar todos
                </Button>
              </div>
            </div>

            <ul className="space-y-2">
              {sortedFiles.map((file) => (
                <li key={file.id} className="flex items-start justify-between p-3 border rounded-sm hover:bg-neutral-50">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">{file.fileName}</div>
                    <div className="text-xs text-neutral-500 space-y-0.5">
                      <div>📅 {new Date(file.uploadDate).toLocaleString('pt-BR')}</div>
                      <div>📊 {file.data.rows.length} registros</div>
                      <div className="text-[10px] text-neutral-400 font-mono">ID: {file.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFile(file.id)}
                    variant="ghost"
                    size="sm"
                    className="ml-3 text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
        <div className="text-xs text-neutral-700 border rounded-sm p-3">
          {isLoading ? (
            <div className="text-center py-4 text-neutral-500">Carregando arquivos...</div>
          ) : ataFiles.length === 0 ? (
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
                    <Button
                      onClick={() => removeByPeriodo(periodoLetivo)}
                      variant="ghost"
                      size="sm"
                      className="text-[10px] text-red-600 hover:underline h-auto px-0 py-0"
                    >
                      Excluir período
                    </Button>
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
                            <Button
                              onClick={() => removeByModalidade(mod, periodoLetivo)}
                              variant="ghost"
                              size="sm"
                              className="text-[10px] text-red-600 hover:underline h-auto px-0 py-0"
                            >
                              Excluir modalidade
                            </Button>
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
  );
}



## Análise da Persistência - Ficha Individual Histórico
### 1. Arquitetura em Camadas
O fluxo de persistência segue esta estrutura:
XLSX → Parser → Serializer → Pipeline → Persistor → Banco de Dados
### 2. Registro do Perfil
No arquivo index.ts, o perfil se auto-registra:
registerProfile("fichaIndividualHistorico", {
  resolvers: fichaIndividualResolvers,
  serializer: serializarFichaDisciplina,
  xlsxPersistor: async (tx, params) => persistSeriesHistorico(...)
});
### 3. Fluxo de Execução
#### Passo 1: Pipeline XLSX (pipeline.ts)
Busca os componentes do perfil no registry
Executa o extrator XLSX (parsing)
Chama o serializer para gerar LogicalLine[]
Calcula hash dos dados
Inicia transação do Prisma
#### Passo 2: Gravação das Metadados (pipeline.ts)
// Cria registro do arquivo importado
const arquivo = await tx.arquivoImportado.create({
  data: { nomeArquivo, hashArquivo, tipo, status: "ativo" }
});

// Cria todas as linhas lógicas (rastreabilidade)
await tx.linhaImportada.createMany({ data: linhasPayload });
#### Passo 3: Persistência de Domínio (pipeline.ts)
if (components.xlsxPersistor) {
  domain = await components.xlsxPersistor(tx, { parsed, lines, profile, alunoId });
}
### 4. Função de Persistência Específica
O arquivo persist.ts contém a lógica de negócio: 4.1. Validações iniciais:
if (!alunoId) return { persistido: false, motivo: "alunoId ausente" };
const aluno = await tx.aluno.findUnique({ where: { id: alunoId } });
4.2. Para cada série no histórico: a) Upsert da SerieCursada (linhas 42-67):
const serieRecord = await tx.serieCursada.upsert({
  where: {
    alunoMatricula_anoLetivo_periodoLetivo_curso_serie: {
      alunoMatricula: aluno.matricula,
      anoLetivo, periodoLetivo, curso, serie
    }
  },
  create: { /* dados completos */ },
  update: { /* apenas campos não-nulos */ }
});
b) Limpa disciplinas antigas (linhas 69-71):
await tx.historicoEscolar.deleteMany({
  where: { serieCursadaId: serieRecord.id }
});
c) Insere novas disciplinas (linhas 73-86):
await tx.historicoEscolar.createMany({
  data: serie.disciplinas
    .filter((d) => d.componenteCurricular)
    .map((d) => ({
      serieCursadaId: serieRecord.id,
      componenteCurricular, cargaHoraria, frequencia, totalPontos, faltasTotais
    }))
});
### 5. Estrutura do Banco de Dados
Tabela: series_cursadas (linhas 154-183)
Chave composta única: (alunoMatricula, anoLetivo, periodoLetivo, curso, serie)
Armazena: dados do contexto + resumo da série (carga horária total, frequência global, situação final)
Relação: 1 SerieCursada → N HistoricoEscolar
Tabela: historicos_escolares (linhas 185-199)
Relacionada a SerieCursada via serieCursadaId
Armazena: cada disciplina cursada (componente curricular, carga horária, frequência, pontos, faltas)
Cascade delete: se a série for deletada, as disciplinas também são
### 6. Rastreabilidade
Duas camadas de rastreabilidade:
arquivoImportado: Metadados do arquivo (nome, hash, tipo, status)
linhaImportada: Cada linha lógica com:
dadosOriginais: JSON com todos os dados brutos
identificadorChave: Chave para deduplicação (ex: "JOÃO DA SILVA|01/01/2000")
tipoEntidade: "HistoricoEscolar"
### 7. Estratégia de Atualização
A persistência usa UPSERT + DELETE + CREATE:
Upsert: Atualiza a série se já existe, cria se não existe
Delete: Remove TODAS as disciplinas antigas
Create: Insere TODAS as disciplinas do arquivo atual
Isso garante que o histórico fique exatamente como está no arquivo importado.
### 8. Pontos de Atenção
Positivos:
Transação atômica (tudo ou nada)
Rastreabilidade completa dos dados originais
Deduplicação por hash
Chave composta evita duplicações
Cascade delete mantém integridade
Considerações:
A estratégia "delete all + insert all" pode ser pesada se houver muitas disciplinas
Não há auditoria automática das mudanças (apenas rastreabilidade)
O campo turma no SerieCursada não faz parte da chave única, mas está nos dados de contexto
Quer que eu detalhe algum aspecto específico da persistência?
# DECISÕES TÉCNICAS — VERSÃO DETALHADA

- **Propósito**: detalhar regras e nuances de mapeamento/extração para o Agente de IA, sem mexer no registry produtivo (`src/lib/mapeamentos/importacaoFichaIndividualHistorico.ts`). Use em conjunto com `TECNICO.md` (resumo) e o mapeamento TS.
- **Escopo**: vale para Importação de Ficha Individual - Histórico. Não altera contratos de UI/BE; serve para orientar preenchimento de `iaMeta` e geração de checkpoints.

## Extração (XLSX/XML)
- XLSX é lido via XML interno (inlineStr/sharedStrings). Mapear `xl/workbook.xml` → sheets; cada `xl/worksheets/sheet*.xml` contém dados. Sem libs externas.
- Estrutura típica: 4 sheets. Dados de aluno se repetem em todas; varia TURMA/SÉRIE/CURSO por sheet (inclui eletivas).
- Headers variam e podem ter pontuação/sufixos (“%FR.”, “T.F.”). Antes de dar match, normalizar header removendo pontuação final e espaços.
- Situação final pode vir com frase longa, ex.: “À VISTA DOS RESULTADOS OBTIDOS O(A) ALUNO(A) FOI CONSIDERADO(A):”. Extraia apenas o valor final (após os dois-pontos).

## Normalização (default + casos)
- Datas: dd/mm/aaaa → ISO (YYYY-MM-DD).
- Números (faltas/notas/pontos/carga horária): parse para int/float; remover separadores não numéricos.
- Strings: trim + upper, salvo exceções explícitas em `iaMeta`.
- Percentuais: se header indicar frequência (`%FR`), normalizar para percent (0–100) ou fração conforme decisão no `iaMeta`.

## Dedupe/vínculo
- Chave de vinculação: `NOME DO ALUNO` + `DATA DE NASCIMENTO` + escola/contexto (quando disponível). Se não encontrar ou houver duplicidade, marcar arquivo/linha como erro para revisão manual.
- `SEXO` pode validar consistência, mas não quebra dedupe sozinho.

## Regras por campo (nuances)
- `NOME DO ALUNO`: vem de XLSX; usar como parte da chave de vinculação. Normalizar trim/upper.
- `DATA DE NASCIMENTO`: XLSX; parse dd/mm/aaaa → ISO. Parte da chave de vinculação.
- `SEXO`: XLSX; domínio esperado {M, F}. Usar para validação.
- `PAI`, `MÃE`: XLSX; não vinculam modelo de dados hoje. Guardar para exibição/apoio se desejado; caso ausentes, não bloquear.
- `ANO LETIVO`, `PERÍODO LETIVO`, `CURSO`, `SÉRIE`, `TURMA`: preferir XML; se faltante, buscar no cabeçalho do XLSX. São de composição (contexto) e servem para organizar séries/turmas; ausência deve sinalizar erro de contexto.
- `COMPONENTE CURRICULAR`: XML; rótulos de disciplina. Normalizar trim/upper. Persistir em `HistoricoEscolar.componenteCurricular`.
- `CARGA HORÁRIA`: XML; numérico (int). Persistir em `HistoricoEscolar.cargaHoraria`.
- `CARGA HORÁRIA TOTAL`: XML; numérico (int). Persistir em `SerieCursada.cargaHorariaTotal`.
- `FREQUÊNCIA`: XML; pode vir como número de faltas ou percentual por disciplina. Confirmar no arquivo e ajustar normalização no `iaMeta`.
- `FREQUÊNCIA GLOBAL`: XML; percent ou fração da série. Persistir em `SerieCursada.frequenciaGlobal`.
- `TOTAL DE PONTOS`: XML; numérico (float/int). Persistir em `SerieCursada.totalPontos`.
- `SITUAÇÃO FINAL`: XML; extrair valor final do rótulo longo. Persistir em `SerieCursada.situacaoFinal`.

## Erros e mensagens
- Tipos de erro esperados: header/label não encontrado; valor fora do domínio; duplicidade na chave de vínculo; sheet esperada ausente; parse de data inválido.
- Mensagens recomendadas: curto + campo + causa (ex.: `FREQUÊNCIA GLOBAL: valor fora do domínio [%]`; `ANO LETIVO: header não encontrado`).

## Interação com IA / metadados
- Apenas `iaMeta` (ou arquivo paralelo de meta) deve receber preenchimentos automáticos (status/perguntas/fonte/normalização sugerida). Campos produtivos permanecem imutáveis pelo agente.
- Fluxo sugerido para o agente:
  1) Aplicar regras globais deste arquivo + `TECNICO.md`.
  2) Identificar campos com `[A DEFINIR]`/status “todo” em `iaMeta`.
  3) Formular perguntas objetivas (sheet/xpath/header, domínio de valores, normalização).
  4) Preencher `iaMeta` e atualizar checkpoints.
  5) Não alterar contratos de domínio (tipos/campos/tabelas).

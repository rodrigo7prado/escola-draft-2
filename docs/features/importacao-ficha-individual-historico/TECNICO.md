# PERFIL TÉCNICO DA FUNCIONALIDADE GERAL IMPORTAÇÃO, PRINCÍPIOS DE REUSO

[ ] **IMPORTANTE**: TODA funcionalidade própria da categoria de importação apenas será criada SOB MINHA ACEITAÇÃO. Do contrário, a funcionalidade de importação de Ficha Individual

[ ] T1: O Painel de Migração hoje compreende apenas a categoria de Ata de Resultados Finais. E todas as funcionalidades ali presentes serão extendidas para contemplar a importação de Ficha Individual - Histórico. Para esse fim, as seguintes funcionalidades serão abstraídas e reutilizadas, adatadas conforme necessário:

## Levantamento técnico dos arquivos de Ficha Individual (XLSX)

- Método de leitura: parsing direto dos XLSX via XML (inlineStr/sharedStrings) sem dependências externas. Percorremos `xl/workbook.xml` para mapear sheets e `xl/worksheets/sheet*.xml` para extrair textos dos rótulos e tabelas.
- Estrutura encontrada: cada arquivo possui 4 sheets (Sheet1/2/3/4). Os dados do aluno se repetem em todas as sheets; o que varia é TURMA/SÉRIE/CURSO conforme eletiva/grade.
- Campos de aluno e contexto (todos presentes nos XLSX): `NOME DO ALUNO`, `DATA DE NASCIMENTO`, `SEXO`, `NATURAL`, `PAI`, `MÃE`, `ESCOLA`, `ANO`, `CURSO`, `TURMA`, `SÉRIE`, `TURNO`, `PERÍODO`.
  - Exemplos: NOME DO ALUNO: ANNA CLARA SAMPAIO GOMES; DATA DE NASCIMENTO: 25/05/2006; SEXO: F; NATURAL: RIO DE JANEIRO - RJ; PAI: PEDRO SAMPAIO PEREIRA; MÃE: VERA LUCIA DA SILVA GOMES; ESCOLA: 33063397 - CE SENOR ABRAVANEL; ANO: 2022/2023/2024 conforme sheet; TURMA: 1005, 1001, IF_CIA_2001, IF_CIA_3001, ELET1-M-1006, ELET2-M-1006, ELET3-M-1005, IF_SE_2002; SÉRIE: 1/2/3; TURNO: M; PERÍODO: 0.
- Tabelas de disciplinas/notas/faltas: começam na linha de cabeçalho “DISCIPLINA” com colunas de faltas por bimestre (1ºB–4ºB, T.F., C.H., %FR) e rendimento escolar por bimestre, total de pontos, média final, frequência anual. Os nomes de colunas têm variações (“T.F.”, “%FR.” etc.); será necessário mapear estes rótulos “estranhos” para campos internos.
- Observação de conteúdo por arquivo:
  - `serie1.xlsx`: Sheet1 (curso MÉDIO, turma 1005, série 1, ano 2022) e eletivas em Sheets 2/3/4 (curso DIVERSOS, turmas ELET1-M-1006, ELET2-M-1006, ELET3-M-1005, mesma série/ano/turno/período).
  - `serie2.xlsx`: Sheet1 (curso MÉDIO, turma 1001, série 1, ano 2023); Sheet2 (curso MÉDIO, turma IF_CIA_2001, série 2, ano 2023).
  - `serie3.xlsx`: Sheet1 (curso MÉDIO, turma IF_CIA_3001, série 3, ano 2024); Sheet2 (curso MÉDIO, turma IF_SE_2002, série 2, ano 2024).
- Ponto crítico: os XLSX não trazem matrícula. A dedupe/vínculo com aluno terá de ser definida por outra chave (ex.: nome + data de nascimento + escola) ou enriquecida externamente.

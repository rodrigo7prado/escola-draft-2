[ ] **IMPORTANTE**: TODA implementação será feita APENAS SOB MINHA ACEITAÇÃO prévia da concepção.

# PARTE 1: INTERFACE DE USUÁRIO - PAINEL DE MIGRAÇÃO

[x] CP1: Já que atualmente o Painel de Migração contempla apenas a categoria de Ata de Resultados Finais, o componente MigrateUpload.tsx está fortemente acoplado a essa categoria. Portanto, as seguintes modificações serão necessárias:
  [x] CP1.1: Renomear o componente MigrateUploadWrapper.tsx para MigrateAtaResultsUpload.
    [x] TEC1.1.1: Este componente servirá apenas para referência de abstração. Ele não será mais utilizado. Será removido posteriormente.
  [x] CP1.2: Criar um novo componente MigrateUploadWrapper.tsx, que será genérico e será um wrapper que conterá múltiplas categorias de importação (neste momento visa-se Ata de Resultados Finais e Ficha Individual - Histórico).
    [x] TEC1.2.1: A instância referente a Ata de Resultados Finais não terá modificações relevantes, apenas a mudança de estrutura aqui documentada.
    [x] TEC1.2.2: A instância referente a Ficha Individual - Histórico será inicialmente apenas mockada, e implementada quando o checkpoint chegar em CP2..
  [x] CP1.3: Criar MigrateCategoryUpload.tsx, que será o componente genérico que receberá como props a categoria de importação (Ata de Resultados Finais ou Ficha Individual - Histórico) e renderizará o componente específico correspondente.
    [x] TEC3.1.3.1: Esse componente será responsável por decidir qual componente específico renderizar com base na categoria recebida via props.
    [x] TEC3.1.3.2: Esse componente terá a algumas modificações em relação ao MigrateUpload.tsx original, para torná-lo genérico.
      [x] TEC3.1.3.2.1: o componente de categoria terá sua própria borda, título, botão de seleção de arquivos e área de visualização.
      [x] TEC3.1.3.2.2: a funcionalidade de drop de arquivos não será mais mantida;
  [x] CP1.4: Modificar o Painel de Migração para utilizar o novo MigrateUploadWrapper.tsx.
    [x] TEC3.1.4.1: Incluir ambas as categorias de importação (Ata de Resultados Finais e Ficha Individual - Histórico) no wrapper.
[x] CP2: Implementação da categoria de importação de Ficha Individual - Histórico.
[x] CP3: Testes, refatoração de testes e validações finais.
[x] CP4: Remoção do componente MigrateAtaResultsUpload.tsx, que não será mais necessário.

# PARTE 2: BACKEND - PROCESSAMENTO DE ARQUIVOS DE FICHA INDIVIDUAL - HISTÓRICO
[ ] CP1: 
[ ] CP1: Fornecimento de arquivos de exemplo e mapeamento: obter amostras reais de arquivos XLSX de Ficha Individual - Histórico para análise e testes.
  [ ] TEC1.1: O motivo de upload não ser de um csv ou xml é que os relatórios nesses arquivos não exportam os dados do aluno, impossibilitando a vinculação correta.
  [ ] TEC1.2
  [ ] TEC1.2: O arquivos XLSX (o arquivos de exemplo se encontra em [`serie1`](/docs/templates/FichasIndividuaisExemplos/serie1.xlsx)) não contém a matrícula do aluno, mas contém o nome, filiação, data de nascimento, sexo, etc, além do histórico escolar com notas e faltas, situação, etc. ASSIM SENDO:
    [ ] TEC1.2.1: Mapeamento dos campos disponíveis nos arquivos XLSX:
      [ ] TEC1.2.1.1: Dados do aluno: `NOME DO ALUNO`, `DATA DE NASCIMENTO`, `SEXO`, `NATURAL`, `PAI`, `MÃE`.
      [ ] TEC1.2.1.2: Contexto escolar: `ANO LETIVO`, `PERÍODO LETIVO`, `CURSO`, `TURMA`, `SÉRIE`.
      [ ] TEC1.2.1.3: Histórico escolar: tabelas de disciplinas com colunas de notas e faltas por bimestre, total de pontos, média final, frequência anual.
    [ ] TEC1.2.2: Estratégia de extração dos dados dos arquivos XLSX:
      [ ] TEC1.2.1: A estratégia prioritária é extrair a partir de xml confiável que contenha todos os tipos de dados.
      [ ] TEC1.2.2: Caso não seja possível, dividir a importação em duas etapas:
        [ ] TEC1.2.2.1: método para extração dos dados do aluno (nome, data de nascimento, filiação, etc) a partir de campos do XLSX.
        [ ] TEC1.2.2.2: método para extração do histórico escolar (notas, faltas, situação, etc) a partir de XML interno do XLSX.
          [ ] TEC1.2.2.2.1: Mapear rótulos de coluna (ex.: “T.F.”, “%FR.”);
      [ ] TEC1.2.3: Lembrando que nos arquivos XLSX, há múltiplas sheets, que correspondem a diferentes tipos de componentes curriculares (obrigatórios, eletivas, etc). Cada sheet deve ser processada individualmente para extrair o histórico completo do aluno.
    [ ] TEC1.2.3: Estratégia de dedupe:
      [ ] TEC1.2.3.1: O nome do aluno + ano letivo + turma serão utilizados para vincular o arquivo ao aluno correto.
      [ ] TEC1.2.3.2: Caso não encontre o aluno, ou haja duplicidade, o arquivo será marcado como erro e o usuário será notificado para correção manual.
[ ] CP2: API surface: mapear rotas/endpoints usados por Ata (ex.: POST /api/files, GET /api/files, DELETE /api/files?periodo=...), payloads, códigos de erro (ex.: 409 para duplicado), e onde ficam os handlers.
[ ] CP3: Pipeline de processamento: parsing CSV (headers obrigatórios), validação, deduplicação (chave ALUNO), adaptação de dados para o modelo interno e persistência (banco/armazenamento). Identificar funções utilitárias e serviços que possam ser parametrizados.
[ ] CP4: Modelos e storage: como são armazenados os “períodos/turmas/alunos” carregados, estrutura de dados em banco/memória, e como o estado é retornado para a UI (estrutura de PeriodoData / TurmaData).
[ ] CP5: Reuso/DRY: pontos fáceis de generalizar (ex.: validador de CSV, dedupe por chave, estratégia de versionamento e reset) e pontos que precisarão de variantes específicas para Ficha (novos headers, regras de negócio diferentes).
[ ] CP6: Observabilidade/erros: padrões de log/erros já usados (ex.: mensagens de duplicado) para manter consistência.
[ ] CP7: Contratos de UI: o que a UI espera hoje (ex.: formato do JSON em /api/files) e se precisaremos versionar ou introduzir namespace por categoria.
[ ] CP8: Testes: identificar testes unitários/integrados existentes para Ata e como replicar/adaptar para Ficha Individual - Histórico.
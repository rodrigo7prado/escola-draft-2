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

# PARTE 2: BACKEND - PROCESSAMENTO DE ARQUIVOS DE FICHA INDIVIDUAL - 
[ ] CP1: Aqui será feita uma estruturação para uma abstração para todos os parsers. Mas NENHUMA refatoração será feita agora. FOCAREMOS APENAS na implementação do parser de Ficha Individual - Histórico.
[ ] CP2: Serão os PRINCÍPIOS da REESTRUTURAÇÃO dos parsers:
  [ ] CP2.1: Todo parser passará pelas mesmas etapas. Por exemplo:
    - Extração;
    - Normalização (Opcional);
    - Persistência.
  [ ] CP2.2: Cada uma dessas etapas será uma função que comporá uma orquestração fixa.
  [ ] CP2.3: Paralelamente a isso, cada parser terá particularidades atendidas graças a mapeamentos declarativos.
  [ ] CP2.4: Um protótipo inicial dessa estruturação está representado no arquivo `docs/features/parsers/EXEMPLO_PLUGAVEL.md`.
  [ ] CP2.5: O parser de Ficha Individual - Histórico será implementado seguindo essa estrutura. Os outros parsers não serão tocados agora.
  [ ] CP2.6: Alguns modelos de protótipo para o mapeamento estão em `docs/features/parsers/modelos`, tanto em Campo.type.md quanto em importacaoFichaIndividualHistorico.md. Leia-os para entender as particularidades do mapeamento. Mas não precisamos segui-lo à risca. É apenas um guia.
[ ] CP3: Algumas explicações técnicas
  [ ] TEC3.1: O motivo de upload não ser de um csv ou xml é que os relatórios nesses arquivos não exportam os dados do aluno, impossibilitando a vinculação correta.
  [ ] TEC3.2: O arquivos XLSX (o arquivos de exemplo se encontra em [`serie1`](/docs/templates/FichasIndividuaisExemplos/serie1.xlsx)) não contém a matrícula do aluno, mas contém o nome, filiação, data de nascimento, sexo, etc, além do histórico escolar com notas e faltas, situação, etc. ASSIM SENDO:
    [ ] TEC3.2.1: Alguns dados serão extraídos do XLSX;
    [ ] TEC3.2.2: Outros serão pegos do XML interno do XLSX (sharedStrings e afins);
    [ ] TEC3.2.3: Veremos os detalhes juntos quando analisarmos o arquivo de modelo.
    [ ] TEC3.2.4: Lembrando que nos arquivos XLSX, há múltiplas sheets, que correspondem a diferentes tipos de componentes curriculares (obrigatórios, eletivas, etc). Cada sheet deve ser processada individualmente para extrair o histórico completo do aluno.
    [ ] TEC3.2.3: Estratégia de dedupe:
      [ ] TEC3.2.3.1: O nome do aluno + ano letivo + turma serão utilizados para vincular o arquivo ao aluno correto.
      [ ] TEC3.2.3.2: Caso não encontre o aluno, ou haja duplicidade, o arquivo será marcado como erro e o usuário será notificado para correção manual.
[ ] CP4: Outros detalhes de implementação serão tratados posteriormente.
[ ] CP5: Testes: identificar testes unitários/integrados existentes para Ata e como replicar/adaptar para Ficha Individual - Histórico.
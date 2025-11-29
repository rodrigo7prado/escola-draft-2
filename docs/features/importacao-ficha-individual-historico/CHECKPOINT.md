[ ] **IMPORTANTE**: TODA implementação será feita APENAS SOB MINHA ACEITAÇÃO prévia da concepção.
[ ] Para todo DRY, consultar o arquivo `docs/dry/UI.dry.md` para verificar se há DRYs relacionados à interface de usuário.

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

# PARTE 2: PROCESSAMENTO DE PARSER DE FICHA INDIVIDUAL
[x] CP1: Aqui será feita uma estruturação para uma abstração para todos os parsers. Mas NENHUMA refatoração será feita agora. FOCAREMOS APENAS na implementação do parser de Ficha Individual - Histórico.
[x] CP2: Serão os PRINCÍPIOS da REESTRUTURAÇÃO dos parsers:
  [x] CP2.1: Todo parser passará pelas mesmas etapas. Por exemplo:
    - Extração;
    - Normalização (Opcional);
    - Persistência.
  [x] CP2.2: Cada uma dessas etapas será uma função que comporá uma orquestração fixa.
  [x] CP2.3: Paralelamente a isso, cada parser terá particularidades atendidas graças a mapeamentos declarativos.
  [x] CP2.4: Um protótipo inicial dessa estruturação está representado no arquivo `docs/features/parsers/EXEMPLO_PLUGAVEL.md`.
  [x] CP2.5: O parser de Ficha Individual - Histórico será implementado seguindo essa estrutura. Os outros parsers não serão tocados agora.
  [x] CP2.6: Alguns modelos de protótipo para o mapeamento estão em `docs/features/parsers/modelos`, tanto em Campo.type.md quanto em importacaoFichaIndividualHistorico.md. Leia-os para entender as particularidades do mapeamento. Mas não precisamos segui-lo à risca. É apenas um guia.
[x] CP3: Algumas explicações técnicas
  [x] TEC3.1: O motivo de upload não ser de um csv ou xml é que os relatórios nesses arquivos não exportam os dados do aluno, impossibilitando a vinculação correta.
  [x] TEC3.2: O arquivos XLSX (o arquivos de exemplo se encontra em [`serie1`](/docs/templates/FichasIndividuaisExemplos/serie1.xlsx)) não contém a matrícula do aluno, mas contém o nome, filiação, data de nascimento, sexo, etc, além do histórico escolar com notas e faltas, situação, etc. ASSIM SENDO:
    [x] TEC3.2.1: Alguns dados serão extraídos do XLSX;
    [x] TEC3.2.2: Outros serão pegos do XML interno do XLSX (sharedStrings e afins);
    [x] TEC3.2.3: Veremos os detalhes juntos quando analisarmos o arquivo de modelo.
    [x] TEC3.2.4: Lembrando que nos arquivos XLSX, há múltiplas sheets, que correspondem a diferentes tipos de componentes curriculares (obrigatórios, eletivas, etc). Cada sheet deve ser processada individualmente para extrair o histórico completo do aluno.
    [ ] TEC3.2.5: Estratégia de dedupe de arquivos: 
      [ ] TEC3.2.5.1: O dedupe será feito com base no ARQUIVO INTEIRO, e não por campos individuais.
      [ ] TEC3.2.5.2: Caso o arquivo aceito tenha registros no banco, o conteúdo do banco será atualizado com o novo conteúdo.
    [ ] TEC3.2.6: Estratégia de vínculo ao aluno:
      [ ] TEC3.2.6.1: O nome do aluno + ano letivo + período letivo + turma serão utilizados para vincular o arquivo ao aluno correto.
      [ ] TEC3.2.6.2: Caso não encontre o aluno, realizar a seguinte tarefa:
        [ ] TEC3.2.6.2.1: Obter os 15 primeiros caracteres do nome do arquivo importado, e se forem números, considerar como matrícula;
        [ ] TEC3.2.6.2.2: Caso não sejam, anular a operação de persistência do arquivo;
        [ ] TEC3.2.6.2.3: Se encontrar, EXIBIR NUM MODAL:
            - A matrícula encontrada;
            - Em um lado, os dados do arquivo importado;
            - Em outro lado, os dados do aluno encontrado;
            - Botão de confirmar vínculo;
            - Botão de cancelar (neste caso, anular a operação de persistência do arquivo);
          [ ] TEC3.2.6.2.3.2: Ao confirmar vínculo, [confirmar por digitação da matrícula][DRY.UI.1.2];

# PARTE 3: BACKEND - API DE IMPORTAÇÃO DE FICHA INDIVIDUAL E TESTES
[ ] CP1: Persistência: ausência de linha-a-linha para cada série/disciplinas impede mostrar progresso/erros no painel.
  [ ] TEC1.1: Criar campo status em LinhaImportada com estados: PENDENTE, ERRO, SUCESSO.
  [ ] TEC1.2: Durante persistência, atualizar status de cada linha.
  [ ] TEC1.3: Modificar GET para retornar linhas com status e mensagens de erro.
[ ] CP2: API e painel não integram o parser nem reportam inconsistências específicas (header ausente, sheet faltante, valores fora do domínio).
  [ ] TEC2.1: De acordo com o modelo dado em docs/templates/arquivosDeExemplo/FichasIndividuaisExemplos/serie1.xlsx, implementar filtro que valida os headers esperados em cada sheet.
  [ ] TEC2.2: Em caso de inconsistência, abortar operação de persistência, excluindo o arquivo importado, e retornando erro detalhado no GET.
[ ] CP3: Testes só cobrem parsing feliz; não há integração com Prisma ou cobertura de erros/dedupe.
  [ ] TEC3.1: Traçar estratégia para corrigir.

# PARTE 4: FRONTEND - PAINEL DE MIGRAÇÃO DE FICHA INDIVIDUAL E TESTES
[ ] CP1: Atualizar MigrateFichaHistoricoUpload para aceitar .xlsx, enviar FormData para /api/importacao-ficha-individual-historico, mostrar estados (upload, sucesso, erro de duplicata hash, erro de vínculo).
[ ] CP2: Exibir um painel resumido reaproveitando o padrão do Painel atual: cards por aluno ou por arquivo com contagens (séries lidas, séries persistidas, pendências de vínculo, duplicatas), e lista de pendências com motivo.
[ ] CP3: Manter categorias paralelas no wrapper (src/components/MigrateUploadWrapper.tsx), sem quebrar a experiência da Ata; adicionar refresh automático após upload usando o novo GET.

# PARTE 5: TESTES E VALIDAÇÕES FINAIS
[ ] CP1: Parser: adicionar casos de erro (sheet ausente, header com sufixo, percentuais/faltas fora de domínio, frase longa de situação) e checar dedupe key gerada.
[ ] CP2: API: testes de integração com Prisma em banco de teste (var DATABASE_URL_TEST + prisma db push no setup) cobrindo: upload ok, hash duplicado (409), vínculo ausente, duplicidade de aluno, e persistência de séries/disciplinas. Onde DB for pesado, mockar Prisma no nível do handler para cenários de erro de parse.
[ ] CP3: Painel: testes de componente (React Testing Library) garantindo que estados “uploading/erro/sucesso/pendente de vínculo” rendereriam corretamente e que a hierarquia de pendências aparece a partir do GET mockado.
[ ] CP4: Inconsistências a rastrear: header/label não encontrado, sheet faltante, parse de data inválido, percentuais fora do domínio, chave de vínculo sem match ou duplicada, arquivo hash duplicado.

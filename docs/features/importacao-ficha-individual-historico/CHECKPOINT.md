[ ] **IMPORTANTE**: TODA implementação será feita APENAS SOB MINHA ACEITAÇÃO prévia da concepção.

[ ] CP1: Já que atualmente o Painel de Migração contempla apenas a categoria de Ata de Resultados Finais, o componente MigrateUpload.tsx está fortemente acoplado a essa categoria. Portanto, as seguintes modificações serão necessárias:
  [ ] CP1.1: Renomear o componente MigrateUploadWrapper.tsx para MigrateAtaResultsUpload.
    [ ] TEC1.1.1: Este componente servirá apenas para referência de abstração. Ele não será mais utilizado. Será removido posteriormente.
  [ ] CP1.2: Criar um novo componente MigrateUploadWrapper.tsx, que será genérico e será um wrapper que conterá múltiplas categorias de importação (neste momento visa-se Ata de Resultados Finais e Ficha Individual - Histórico).
    [ ] TEC1.2.1: A instância referente a Ata de Resultados Finais não terá modificações relevantes, apenas a mudança de estrutura aqui documentada.
    [ ] TEC1.2.2: A instância referente a Ficha Individual - Histórico será inicialmente apenas mockada, e implementada quando o checkpoint chegar em CP2..
  [ ] CP1.3: Criar MigrateCategoryUpload.tsx, que será o componente genérico que receberá como props a categoria de importação (Ata de Resultados Finais ou Ficha Individual - Histórico) e renderizará o componente específico correspondente.
    [ ] TEC3.1.3.1: Esse componente será responsável por decidir qual componente específico renderizar com base na categoria recebida via props.
    [ ] TEC3.1.3.2: Esse componente terá a algumas modificações em relação ao MigrateUpload.tsx original, para torná-lo genérico.
      [ ] TEC3.1.3.2.1: o componente de categoria terá sua própria borda, título, botão de seleção de arquivos e área de visualização.
      [ ] TEC3.1.3.2.2: a funcionalidade de drop de arquivos não será mais mantida;
  [ ] CP1.4: Modificar o Painel de Migração para utilizar o novo MigrateUploadWrapper.tsx.
    [ ] TEC3.1.4.1: Incluir ambas as categorias de importação (Ata de Resultados Finais e Ficha Individual - Histórico) no wrapper.
CP2: Implementação da categoria de importação de Ficha Individual - Histórico.
CP3: Testes, refatoração de testes e validações finais.
CP4: Remoção do componente MigrateAtaResultsUpload.tsx, que não será mais necessário.
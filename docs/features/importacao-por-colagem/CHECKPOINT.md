*Para uso das IAs*

⚠️ **LEITURA OBRIGATÓRIA ANTES DE QUALQUER AÇÃO:**
1. 🔴 **PARE AQUI** - Leia [`IDD.md`](../../IDD.md) PRIMEIRO (metodologia base)
2. 🔴 Leia [`REUSO.md`](REUSO.md) (princípios DRY obrigatórios)
3. 🟢 Depois volte e continue lendo este arquivo

**Checkpoint**: Confirme que leu os arquivos acima antes de prosseguir.

**Metodologia seguida**: IDD [`IDD`](./IDD.md) (Importante: se ainda não leu, por favor leia antes de prosseguir)

# CHECKPOINTS DE SESSÕES DE TRABALHO
Sessão 1 (implemetanção de Colagem de Dados Pessoais) - Feature: Importação por Colagem de Dados Pessoais

[x] CP1: Implementação da estrutura de UI com os botões "Copiar matrícula" e "Ativar colagem";
[x] CP2: Implementação do endpoint para salvar os dados pessoais colados no backend;
  [x] CPP2.1: Definição dos campos a serem salvos no banco de dados (nome, data de nascimento, sexo, etc);
    [x] TEC2.1.1: Criação de objeto reutilizável para representar os campos de dados pessoais colados;
    [x] TEC2.1.2: Implementação dos modelos de dados no Prisma e criação das migrações necessárias para ambos os ambientes (desenvolvimento e teste) com `migrate:all`;
[x] CP3: Implementação do parser `parseDadosPessoais` para processar os dados colados, de acordo com as orientações em [`REUSO.md`](REUSO.md);
[x] CP4: Implementação do pré-processamento
  [x] CP4.1: Remoção de cabeçalhos, rodapés e menus do texto colado;
  [x] CP4.2: Reconhecimento de páginas de dados pessoais usando o parser `detectarTipoPagina`;
  [x] CP4.3: Validação de página colada quanto à matrícula correta do aluno selecionado;
[x] CP5: Implementação do modal de confirmação de dados pessoais colados;
  [x] CP5.1: Implementação do input manual do campo Sexo no parser `parseDadosPessoais`, convertendo "Masculino"/"Feminino" para "M"/"F", já que são dados que não conseguem ser extraídos automaticamente do texto colado;
[x] CP6: Implementação da atualização automática da interface do usuário após a confirmação dos dados pessoais colados;
[x] CP7: Testes unitários e de integração do fluxo completo de colagem de dados pessoais;

Sessão 2 (Implementação de Colagem de Dados Escolares) - Feature: Importação por Colagem de Dados Escolares

[ ] CP1: Implementação do parser `parseDadosEscolares` para processar os dados escolares colados, reutilizando a lógica do parser de dados pessoais conforme as orientações em [`REUSO.md`](REUSO.md);
[ ] CP2: Extensão do endpoint existente para salvar os dados escolares colados no backend;
  [ ] TEC2.1: Questão: Como será a extensão do endpoint para suportar tanto dados pessoais quanto escolares? Será um endpoint único com lógica condicional ou endpoints separados?
[ ] CP2.2: Definição dos campos escolares a serem salvos no banco de dados (cursos, disciplinas, notas, etc);
    [ ] TEC2.1.1: Criação de objeto reutilizável para representar os campos de dados escolares colados;
      [ ] TEC2.1.1.1: Criar o objeto de dados escolares colados, reutilizando a estrutura do objeto de dados pessoais colados;
      [ ] TEC2.1.1.2: Definir quais campos escolares serão armazenados no sistema e quais serão ignorados;
    [ ] TEC2.1.2: Implementação dos modelos de dados no Prisma e criação das migrações necessárias para ambos os ambientes (desenvolvimento e teste) com `migrate:all`;
[ ] CP3: Implementação do processamento de parsers;
  [ ] CP3.1: Expansão do reconhecimento de páginas de dados escolares usando o parser `detectarTipoPagina`;
  [ ] CP3.2: Implementação do parser `parseDadosEscolares`, reutilizando a lógica do parser de dados pessoais conforme as orientações em [`REUSO.md`](REUSO.md);
    [x] CP3.2.1: Reutilização do pré-processamento do parser de dados pessoais (remoção de dados não utilizados, etc), adaptando-o para dados escolares conforme necessário;
      [x] REFACT3.2.1: Criado arquivo `parsingUtils.ts` centralizando `normalizarTextoBase()` para reutilização entre parsers;
      [x] REFACT3.2.2: Expandido `parsingUtils.ts` com `normalizarTextoParaComparacao()` configurável (uppercase/lowercase, remoção de caracteres customizável);
      [x] REFACT3.2.3: Refatorados `parseDadosPessoais.ts` e `parseDadosEscolares.ts` para importar funções de `parsingUtils.ts`;
      [x] REFACT3.2.4: Testes validados e passando após refatorações;
    [x] TEC3.2.2: Analisar o pré-processamento existente para dados pessoais e identificar quais partes podem ser reaproveitadas;
    [ ] TEC3.2.3: Adaptar as funções de remoção de cabeçalhos, rodapés e menus para considerar os formatos específicos de páginas de dados escolares;
    [ ] TEC3.2.4: Garantir reaproveitamento da validacão de matrícula do aluno selecionado;
[ ] CP4: Implementação dos testes do parser de dados escolares;
  [ ] TEC4.1: Criar casos de teste unitários para o parser `parseDadosEscolares`, reutilizando a estrutura dos testes do parser de dados pessoais;
  [ ] TEC4.2: Implementar testes de integração para o fluxo completo de colagem de dados escolares, garantindo que os dados sejam processados e salvos corretamente no backend;
[ ] CP5: Implementação do modal de confirmação de dados escolares colados;
  [ ] TEC5.1: Analisar o modal existente para dados pessoais e identificar quais componentes podem ser reaproveitados;
  [ ] TEC5.2: Adaptar o modal para exibir os campos específicos de dados escolares, mantendo a consistência visual e funcional com o modal de dados pessoais;
  [ ] TEC5.4: Haverá necessidade de inputs manuais adicionais para dados escolares, similar ao campo Sexo em dados pessoais? Se sim, implementar conforme necessário, com o mesmo padrão de reutilização;
[ ] CP6: Reuso e expansão da estrutura de atualização automática da interface de usuário (já implementada para dados pessoais), agora para a confirmação dos dados escolares colados;
[ ] CP7: Testes unitários e de integração do fluxo completo de colagem de dados escolares, garantindo que todos campos sejam processados corretamente;
  [ ] TEC7.1: Usar os modelos disponíveis em `docs/templates/DadosEscolaresColagemModelo.md` e `docs/templates/DadosPessoaisColagemModelo.md` para criar casos de teste representativos;
  [ ] TEC7.2: Garantir cobertura completa dos testes, incluindo cenários de sucesso e falha na colagem de dados escolares.
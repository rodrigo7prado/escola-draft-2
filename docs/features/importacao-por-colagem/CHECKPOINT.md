*Para uso das IAs*

# 🚨 PROTOCOLO OBRIGATÓRIO DE INÍCIO DE SESSÃO

**ANTES de ler qualquer checkpoint ou propor ações, o agente DEVE:**

- [ ] **PASSO 1:** Ler [`IDD.md`](../../IDD.md) e resumir a metodologia IDD em 2-3 frases
- [ ] **PASSO 2:** Ler [`REUSO.md`](REUSO.md) e listar os 3 princípios DRY principais
- [ ] **PASSO 3:** Ler este CHECKPOINT até o final
- [ ] **PASSO 4:** Perguntar ao usuário: "Confirmei leitura dos docs. Qual checkpoint devemos trabalhar?"

**⚠️ NÃO pule estes passos. NÃO assuma que já conhece o contexto.**

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

[x] CP1: Implementação do parser `parseDadosEscolares` para processar os dados escolares colados, reutilizando a lógica do parser de dados pessoais conforme as orientações em [`REUSO.md`](REUSO.md);
  [x] TEC_1.1: Dada a complexidade do parse de dados escolares, foi necessário criar uma subfeature específica para o pré-processamento em um checkpoint separado, constando em [](./parse-dados-escolares/WORKFLOW.md);
[x] CP2: Extensão do endpoint existente para salvar os dados escolares colados no backend;
  [x] TEC2.1: Questão: Como será a extensão do endpoint para suportar tanto dados pessoais quanto escolares? Será um endpoint único com lógica condicional ou endpoints separados?
  [x] CP2.2: Definição dos campos escolares a serem salvos no banco de dados;
    [x] TEC2.1.1: Criação de objeto reutilizável para representar os campos de dados escolares colados;
      [x] TEC2.1.1.1: Criar o objeto de dados escolares colados, reutilizando a estrutura do objeto de dados pessoais colados;
      [x] TEC2.1.1.2: Definir quais campos escolares serão armazenados no sistema e quais serão ignorados;
    [x] TEC2.1.2: Implementação dos modelos de dados no Prisma e criação das migrações necessárias para ambos os ambientes (desenvolvimento e teste) com `migrate:all`;
[x] CP3: Implementação do processamento de parsers;
  [x] CP3.1: Expansão do reconhecimento de páginas de dados escolares usando o parser `detectarTipoPagina`;
  [x] CP3.2: Implementação do parser `parseDadosEscolares`, reutilizando a lógica do parser de dados pessoais conforme as orientações em [`REUSO.md`](REUSO.md);
    [x] CP3.2.1: Reutilização do pré-processamento do parser de dados pessoais (remoção de dados não utilizados, etc), adaptando-o para dados escolares conforme necessário;
      [x] REFACT3.2.1: Criado arquivo `parsingUtils.ts` centralizando `normalizarTextoBase()` para reutilização entre parsers;
      [x] REFACT3.2.2: Expandido `parsingUtils.ts` com `normalizarTextoParaComparacao()` configurável (uppercase/lowercase, remoção de caracteres customizável);
      [x] REFACT3.2.3: Refatorados `parseDadosPessoais.ts` e `parseDadosEscolares.ts` para importar funções de `parsingUtils.ts`;
      [x] REFACT3.2.4: Testes validados e passando após refatorações;
    [x] TEC3.2.2: Analisar o pré-processamento existente para dados pessoais e identificar quais partes podem ser reaproveitadas;
    [x] TEC3.2.3: Adaptar as funções de remoção de cabeçalhos, rodapés e menus para considerar os formatos específicos de páginas de dados escolares;
    [x] TEC3.2.4: Garantir reaproveitamento da validacão de matrícula do aluno selecionado;
[x] CP4: Implementação dos testes do parser de dados escolares;
  [x] TEC4.1: Criar casos de teste unitários para o parser `parseDadosEscolares`, reutilizando a estrutura dos testes do parser de dados pessoais;
  [x] TEC4.2: Implementar testes de integração para o fluxo completo de colagem de dados escolares, garantindo que os dados sejam processados e salvos corretamente no backend;
[x] CP5: Processamento da colagem de dados escolares na interface do usuário;
  [x] CP5.1: Adaptação da ação "Ativar colagem" para suportar a colagem de dados escolares, reutilizando a lógica existente para dados pessoais conforme as orientações em [`REUSO.md`](REUSO.md);
    [x] TEC5.1: Reconhecimento automático do tipo de dados colados (pessoais ou escolares) através do parser `detectarTipoPagina`, reutilizando a lógica existente;
    [x] TEC5.2: Garantir que a validação da matrícula do aluno selecionado funcione corretamente para dados escolares, reutilizando a lógica existente; Ou seja, se a matrícula colada não corresponder à do aluno selecionado, exibir mensagem de erro apropriada (ver se já está implementado);
[x] CP6: Extensão do modal de confirmação de dados escolares colados;
  [x] TEC6.1: Analisar o modal existente para dados pessoais e identificar quais componentes podem ser reaproveitados;
  [x] TEC6.2: Adaptar o modal para exibir os campos específicos de dados escolares, mantendo a consistência visual e funcional com o modal de dados pessoais;
  [x] TEC6.4: Haverá necessidade de inputs manuais adicionais para dados escolares, similar ao campo Sexo em dados pessoais? Se sim, implementar conforme necessário, com o mesmo padrão de reutilização;
[ ] CP7: Reuso e expansão da estrutura de atualização automática da interface de usuário (já implementada para dados pessoais), agora para a confirmação dos dados escolares colados;
[ ] CP8: Testes unitários e de integração do fluxo completo de colagem de dados escolares, garantindo que todos campos sejam processados corretamente;
  [ ] TEC8.1: Usar os modelos disponíveis em `docs/templates/DadosEscolaresColagemModelo.md` e `docs/templates/DadosPessoaisColagemModelo.md` para criar casos de teste representativos;
  [ ] TEC8.2: Garantir cobertura completa dos testes, incluindo cenários de sucesso e falha na colagem de dados escolares.

  

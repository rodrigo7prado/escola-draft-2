# DESCRIÇÃO DO SISTEMA
Sistema de emissão de certificados e certidões para alunos de Ensino Médio

# ESTRATÉGIAS DE IMPLEMENTAÇÃO
  - Antes de gerar estruturas permantes, geraremos sempre algum mock para a UI, e gradativamente implementaremos as estruturas.
  - Sempre me pergunte sobre os passos que tomaremos.

# MODELO DE DADOS
  ## MODELO DE DADOS, PONTO DE VISTA DA OBTENÇÃO
  A origem dos dados será o sistema oficial do Conexão Educação da SEEDUC-RJ, através dos arquivos de relatório baixados de lá (.csv, .xml, a princípio).
  Isso significa que o banco de dados refletirá basicamente essa estrutura de dados, aberto, claro, para para eventuais correções e registros adicionais de informação.
  Portanto, apenas modele os dados quando você tiver acesso às estruturas dos arquivos csv/xml.

  ## ORIENTAÇÕES SOBRE O CONCEITO DO MODELO DE DADOS
  O sistema é destinado aos alunos concluintes do Ensino Médio, nas mais diversas modalidades. (Através dos arquivos do Conexão você poderá saber quais)
  Tal modalidade é formada por períodos curriculares, que são anuais (período 0) ou semestrais (períodos 1 e 2).
  Os períodos curriculares, por sua vez, são compostos por componentes curriculares (ou disciplinas).
  Cada período avaliativo (via de regra é bimestral, tendo um período anual 4 bimestres e o semestral 2 bimestres) em um componente curricular conta ao aluno de 0 a 10 pontos como nota. Sendo a média 5, ele é considerado aprovado com 20 pontos totais no regime anual, e 10 pontos totais no regime semestral. Além disso, a aprovação exige 75% de frequência.

  O nível de detalhes provavelmente não acessará o nível de bimestre, apenas o de pontuação geral dos componentes curriculares por enquanto.

# SISTEMA DE DESIGN
- Estruturar o config do tailwind com propriedades personalizadas adequadas para futuros ajustes. Me perguntar o que for necessário.
- Sempre componentize conforme as melhores práticas;
- Abstraia componentes de interface de usuário como <INPUT>, <MODAL>, <DROPDOWN>, <POPOVER>, <TABS>, etc, tal como Radix ou outro.

# PADRÕES DE CÓDIGO E ARQUITETURA
  ## COMPONENTIZAÇÃO (CRÍTICO)
  - **SEMPRE** componentizar ao invés de criar código hard-coded direto
  - Criar componentes genéricos e reutilizáveis em `src/components/ui/`
  - Componentes específicos de domínio em `src/components/`
  - Evitar código repetido - se algo aparece 2x, componentizar

  ## CUSTOM HOOKS
  - **SEMPRE** criar custom hooks para lógica reutilizável
  - Hooks para gerenciamento de estado complexo
  - Hooks para side effects compartilhados
  - Localização: `src/hooks/`
  - Nomenclatura: `use[Nome].ts` (ex: `useFiltros.ts`, `useAlunos.ts`)

  ## ESTRUTURA DE COMPONENTES
  - Componentes devem ser pequenos e com responsabilidade única
  - Máximo de 200 linhas por componente
  - Se ultrapassar, dividir em sub-componentes
  - Props bem tipadas com TypeScript
  - Componentes genéricos devem aceitar className para customização

  ## BOAS PRÁTICAS
  - DRY (Don't Repeat Yourself) - nunca repetir código
  - Separação de concerns (UI vs Lógica vs Dados)
  - Custom hooks para lógica compartilhada
  - Componentes UI genéricos e reutilizáveis
  - Código legível e bem organizado

  ## EXEMPLO DE ESTRUTURA
  ```
  src/
    components/
      ui/              # Componentes genéricos (Button, Tabs, etc)
      dominio/         # Componentes específicos (FiltrosCertificacao, etc)
    hooks/             # Custom hooks
    lib/               # Utilidades e configurações
    app/               # Páginas Next.js
  ```

-----------------------------------------------------------------------------------------------------

# TELA INICIAL
**IMPORTANTE: Todas as funcionalidades principais devem estar integradas diretamente na página inicial.**
Não criar rotas separadas para funcionalidades principais - tudo deve ser acessível na home page através de abas ou seções.
Apenas funcionalidades administrativas/secundárias devem ter páginas separadas.

# TELA CENTRAL DE ALUNOS
  ## CONSTROLES
  - Acima dos demais elementos, haverá um campo de pesquisa bem destacado para pesquisa por nome ou número de matrícula
  - Haverá um controle de "Anterior" e "Próximo" com seta
  - Haverá um controle de seleção para ir-se direto ao primeiro aluno de uma turma específica
  - Haverá também um controle de seleção para uma modalidade específica, jogando para a primeira turma

  ## ORDEM DAS PÁGINAS
  A ordem será de modalidades -> turmas -> alunos (por nome).

  ## FILTROS
  Haverá a possibilidade bem visibilizada na UI para filtragem de pendências/registros sem pendências para uma navegação mais confortável.
  Haverá também filtros por tipos de problemas encontrados, conforme estruturado em ESTRUTURA DAS ESTRATÉGIAS DE SOLUÇÕES DE INCONSISTÊNCIAS.

  ## ESTILIZAÇÃO SEMÂNTICA
  Conforme for estabelecido em ESTRUTURA DAS ESTRATÉGIAS DE SOLUÇÕES DE INCONSISTÊNCIAS, o aluno que apresentar ou não pendências terá rótulos indicando isso na UI.

  ## COMPONENTES

  ### CAMPO DE PESQUISA
    - Conforme se for digitando o nome do aluno ou o número da matrícula, aparecerá uma droplist com os nomes filtrados, apresentando compactdamente o período letivo, a turma, o curso/modalidade, o número de matrícula e o nome completo aluno;
    - A busca incluirá nos matchers caracteres independentes de acentuação, cedilha, etc.
    - A digitação de * significará um coringa, ou seja "AN*SON" filtrará "ANDERSON", etc.
    - As setas para cima e para baixo navegarão nos nomes buscados, e enter selecionará o aluno e apresentará a tela do aluno na central de alunos

  ### CAMPOS DE DADOS
    Número de matrícula (15 dígitos), Nome completo do aluno (limite de caractere compatível com nomes grandes (precisa caber nos layouts)), Sexo, Data de nascimento, Nacionalidade, Naturalidade, UF, RG (padrão flexível, um deles é xx.xxx.xxx-x), Órgão Emisor (Flexível, mas o padrão é "DETRAN"), Data da Emissão, CPF (necessariamente xxx.xxx.xxx-xx);
    Nome completo da mãe, Nome completo do pai, Data de Conclusão do Ensino Médio, Certificação (booleano), Dados conferidos (booleano);
    Ensino Fundamental: Instituição de Ensino, Município/Estado, Ano de Conclusão, Número página, Data de Emissão; Observações (text (1000))

  ### FRAME/Divisão HISTÓRICO ESCOLAR
    O histórico escolar corresponde ao curso (em sua modalidade) (Ex: Ensino Médio Regular, Novo Ensino Médio, Ensino Médio EJA, etc)
    Linhas correspondem aos componentes curriculares
    Colunas de períodos curriculares com colunas de totais de pontuação

  ## ORIENTAÇÕES DE LAYOUT
  Todos os componentes precisam caber inteiramente na tela, preferencialmente sem overflow (obviamente usar overflow se realmente não couber). Portanto, o ideal são os campos estarem lado a lado, e não um por linha. As fontes precisam ser pequenas, mas também legíveis e elementos compactos.

  ### FUNCIONALIDADES
  Nos campos de nome, é necessário ajuste de CSS/tailwind para o texto diminuir conforme o tamanho do nome aumenta.
  Também é necessário que no pressionamento de enter o próximo campo seja focado (como um tab)


# PAINEL DE SOLUÇÃO DE INCONSISTÊNCIAS
  ## GERAL
  A ideia aqui é gerarmos uma UI que sinalize ao usuário de forma organizada e sequenciada  todos os problemas conforme listados nas "estruturas de estratégias de soluções de inconsistências no tópico seguinte".

  **Toda a estrutura da UI seguirá as estruturas definidas em ESTRUTURA DAS ESTRATÉGIAS DE SOLUÇÕES DE INCONSISTÊNCIAS**

  *Provavelmente esta parte do painel será aperfeiçoado conforme formos desenvolvendo no chat. Portanto, seja cuidadoso para não gerar código antes da hora*

  ## ESTILIZAÇÃO SEMÂNTICA
  - Vermelho para PENDENTE
  - Laranja para RESOLVENDO
  - AZUL para OK SEM TER SIDO ALTERADO
  - VERDE para CORRIGIDO

# ESTRUTURA DAS ESTRATÉGIAS DE SOLUÇÃO DE INCONSISTÊNCIAS
  ## NÍVEL 1: BANCO DE DADOS E MIGRAÇÃO
  Ojetivo é detectar se todos os dados necessários foram migrados corretamente.

  **Orientações:**
  1) O que for detectado de componente curricular para um curso em um aluno deverá estar presente em outras instâncias também.
  2) Suspeitar de qualquer pulo de dados (exemplo: haver turma "XXXX-2001, XXXX-2002, XXXX-2004". Provavelmente estará faltando a XXXX-2003).
  3) Sinalizar toda presença referencial sem os dados referenciados em outra instância. Exemplo: haver alunos refernciando a turma XXXX-2003 e não haver a migração da turma XXXX-3.
  4) (*Orientação para geração de código no chat*): Deduzir e me perguntar sobre possíveis dados a serem aplicadas verificação de inconsistência;

  ## NÍVEL 2: ENTREGA DE DOCUMENTOS
  - Me perguntar postiormente quais os documentos

  ## NÍVEL 3: CONSISTÊNCIA DE DADOS
  - Avaliará a presença de dados necessários à produção dos documentos

  ## NÍVEL 4: CONSISTÊNCIA DE HISTÓRICO ESCOLAR
  - (i) Aprovações livres de dependência ou (ii) dependências resolvidas
  - A pontuação de cada componente curricular deve ser consistente com a situação final de aprovação/reprovação
  - devido tratamento à reprovação por falta

  ## NÍVEL 5: PENDÊNCIAS DE TAREFAS
  impressões completas por ano, por turma, por aluno, etc, de certificados e certidões, folhas de registro, etc.

  ## NÍVEL 6: FLUXO DE AÇÕES
  Resolução de pendências -> Impressão por turma em lote -> Impressões individuais conforme resolução de pendências;

  ## EMISSÃO DE RELATÓRIO DE STATUS DE RESOLUÇÃO DE PENDÊNCIAS

  ## CONCEITOS DA INTERFACE DE USUÁRIO
  A ideia é produzir uma UI bem organizada e sequencial, que deixe claro para o usuário a ordem de prioridade das pendências a serem solucionadas

# INSTRUÇÕES SOBRE A TELA DE SOLUÇÃO DE INCONSISTÊNCIAS
  ## INTERFACE INTEGRADA DE VERIFICAÇÃO DE ERROS
  ## INTERFACE INTEGRADA DE EMISSÃO DE DOCUMENTOS DE CONCLUSÃO

# PAINEL DE IMPRESSÃO DOS DOCUMENTOS DE CONCLUSÃO
  ## UI
  - Será apresentada a lista por turma dos alunos prontos e não prontos para impressão, com filtro para seleção e boa sinalização visual;
  ## VALIDAÇÃO PARA IMPRESSÃO
  - Só poderá haver impressão de documentos se não houver incinstência de banco de dados e migração (nível 1)
  - Só poderá ser impresso o documento que não contiver inconsistências de dados (nível 2) e pendência de terefas (nível 3)

  ## TELAS DE IMPRESSÃO
  - Visualização e impressão de certificados em lote e individual a partir da Visualização de Lista de Certificados
  - Visualização e impressão de certidões em lote e individual a partir da Visualização de Lista de Certidões


---------------------------------------------------------------------------------------------------------------

# SOBRE AS ESTRATÉGIAS DE IMPLEMENTAÇÃO
Antes de gerar código, eu preciso que sigamos uma ordem de níveis: (i) primeiro uma compreensão geral integrada, (ii) depois uma compreensão local modularizada, e seguindo em níveis de compreensão até a geração de código.

A finalidade dessa hierarquização é não gerar estruturas em código sem plena compreensão conceitual do projeto.Isso também significa que a qualquer alteração, possamos nos abrir para a possibilidade de editarmos algum desses níveis de generalidade.

Antes de implementar as UI, vamos mockar os dados até termos certeza das estruturas que serão usadas;

**Gostaria que você conseguisse, para além de obedecer as estruturas aqui presentes, também deduzir possibilidades e me perguntar, de modo que eu possa aperfeiçar este arquivo CLAUDE.md.**

# DETALHES DA IMPLEMENTAÇÃO DO BANCO DE DADOS
Trata-se de um banco de dados para um sistema para ser rodado localmente e por outros computadores da rede. Penso em Postgres com Prisma. Pode sugerir o que quiser aqui.

---------------------------------------------------------------------------------------------------------------

# ARQUITETURA E DECISÕES TÉCNICAS

## ESTRUTURA DE ARQUIVOS
```
src/
  app/
    page.tsx                    # Página inicial - TUDO integrado aqui
    alunos/page.tsx            # Página separada (secundária)
  components/
    ui/                        # Componentes genéricos reutilizáveis
      Tabs.tsx                 # Sistema de abas (com context)
      Modal.tsx                # Modal genérico
      ButtonGroup.tsx          # Grupo de botões (seleção única)
    FluxoCertificacao.tsx      # Container: integra filtros + lista de alunos
    FiltrosCertificacao.tsx    # UI de filtros (recebe props, não usa hooks)
    ListaAlunosCertificacao.tsx # Tabela de alunos (recebe props)
    FiltrosHierarquicos.tsx    # Filtros completos (Central de Alunos)
    CentralAlunosSimplified.tsx # Central de alunos com navegação
    MigrateUploads.tsx         # Upload e migração de CSVs
  hooks/
    useFiltrosCertificacao.ts  # Lógica de filtros (ano, turma)
    useAlunosCertificacao.ts   # Busca de alunos filtrados
  lib/
    prisma.ts                  # Cliente Prisma
```

## PRINCIPAIS FEATURES

### 1. FLUXO DE CERTIFICAÇÃO
**Localização:** Aba "Fluxo de Certificação" na página inicial

**Componentes:**
- `FluxoCertificacao` (container)
- `FiltrosCertificacao` (UI de filtros)
- `ListaAlunosCertificacao` (tabela de alunos)

**Hooks:**
- `useFiltrosCertificacao`: gerencia estado dos filtros (ano letivo, turma)
- `useAlunosCertificacao`: busca alunos baseado nos filtros

**Regras de Negócio:**
- Fixo em 3ª série (concluintes)
- Fixo em regime anual (0)
- Modalidade: REGULAR (por enquanto)
- **Inicialização automática:** ano mais recente + primeira turma
- Filtros: Período Letivo (botões) → Turma (botões horizontais)

### 2. CENTRAL DE ALUNOS
**Localização:** Aba "Central de Alunos" na página inicial

**Componentes:**
- `CentralAlunosSimplified` (tudo-em-um)
- `FiltrosHierarquicos` (filtros completos)

**Hierarquia de filtros:**
Período Letivo → Regime → Modalidade → Série → Turma → Aluno

**Funcionalidades:**
- Navegação: Anterior/Próximo
- Pesquisa: por nome ou matrícula (com wildcard *)
- Edição inline de campos
- Comparação: valor original vs editado
- Indicador de fonte ausente

### 3. SISTEMA DE ENTURMAÇÕES
**Model Prisma:** `Enturmacao`

**Estrutura:**
- Um aluno pode ter MÚLTIPLAS enturmações (períodos letivos diferentes)
- Relacionamento: `Aluno` 1-N `Enturmacao`
- Dados: anoLetivo, regime, modalidade, turma, serie, turno

**Parsing de CSV:**
- Campos vêm com prefixos: "Ano Letivo: 2024", "Modalidade: REGULAR"
- **Função `limparValor`** remove prefixos automaticamente
- Implementado em: API de upload e script de migração

### 4. MIGRAÇÃO DE DADOS
**Localização:** Seção "Painel de Migração" na página inicial (details)

**Fluxo:**
1. Upload de CSV
2. Parse e hash para detectar duplicatas
3. Criar registros em `ArquivoImportado` e `LinhaImportada`
4. Criar/atualizar `Aluno`
5. Criar `Enturmacao` (com parsing de prefixos)

**Scripts úteis:**
- `scripts/migrar-enturmacoes.ts`: migra dados existentes para enturmações
- `scripts/diagnosticar-dados.ts`: analisa tamanhos de campos

## DECISÕES ARQUITETURAIS IMPORTANTES

### 1. SEPARAÇÃO DE CONCERNS
✅ **Hooks** = Lógica e estado
✅ **Componentes** = UI pura (recebem props)
✅ **Containers** = Composição (usam hooks + passam props)

**Exemplo:**
```tsx
// ✅ CORRETO
function FluxoCertificacao() {
  const hookData = useFiltrosCertificacao();
  return <FiltrosCertificacao {...hookData} />;
}

// ❌ ERRADO (não fazer)
function FiltrosCertificacao() {
  const hookData = useFiltrosCertificacao(); // lógica dentro da UI
  return <div>...</div>;
}
```

### 2. COMPONENTIZAÇÃO
- Componentes genéricos (ButtonGroup, Tabs, Modal) → `src/components/ui/`
- Componentes de domínio (FiltrosCertificacao) → `src/components/`
- Máximo 200 linhas por componente
- Se ultrapassar: quebrar em sub-componentes

### 3. CUSTOM HOOKS
- Toda lógica reutilizável vira hook
- Nomenclatura: `use[Nome].ts`
- Retornam objetos com estados, handlers e helpers
- Localização: `src/hooks/`

### 4. TIPOS E TYPESCRIPT
- Types compartilhados exportados dos hooks
- Props sempre tipadas
- Usar `type` para objetos simples, `interface` para extensíveis

### 5. BANCO DE DADOS (Prisma)
**Camadas:**
1. **Origem** (imutável): `ArquivoImportado`, `LinhaImportada`
2. **Estruturada** (editável): `Aluno`, `Enturmacao`
3. **Auditoria**: `Auditoria`

**Convenções:**
- Soft delete: `status = 'excluido'`, `excluidoEm`
- Metadados: `origemTipo`, `linhaOrigemId`
- Dados originais preservados em JSONB

### 6. PACKAGE MANAGER
**SEMPRE usar `pnpx` ao invés de `npx`**

## PADRÕES DE UI

### Cores Semânticas
- 🔴 Vermelho: PENDENTE
- 🟠 Laranja: RESOLVENDO
- 🔵 Azul: OK (não alterado)
- 🟢 Verde: CORRIGIDO
- 🟡 Amarelo: Avisos (fonte ausente)

### Tamanhos de Fonte
- Títulos: `text-lg` ou `text-xl`
- Labels: `text-xs`
- Campos: `text-sm`
- Hints: `text-[10px]`

### Espaçamento
- Seções: `space-y-6`
- Elementos internos: `space-y-4`
- Campos de formulário: `gap-3`

## CONVENÇÕES DE NOMENCLATURA

### Componentes
- PascalCase: `FiltrosCertificacao.tsx`
- Sufixos descritivos: `ListaAlunosCertificacao`, `ButtonGroup`

### Hooks
- camelCase com prefixo `use`: `useFiltrosCertificacao.ts`
- Nome descritivo do domínio

### Tipos
- PascalCase com sufixo: `FiltrosState`, `AlunoProps`
- Exportar do mesmo arquivo quando possível

### Variáveis de Estado
- Descritivas: `anosDisponiveis`, `isLoadingTurmas`
- Booleanos: prefixo `is`, `has`, `should`
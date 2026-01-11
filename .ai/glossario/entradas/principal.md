## NOMENCLATURAS FUNDAMENTAIS

- 'PAINEL' = Modo como os módulos são apresentados em Página Única (Single Page).
- 'PÁGINA' = Modo como os módulos são apresentados em Múltiplas Páginas.

## Glossário Principal

### Módulo
**Categoria**: [Componente do Sistema]
**Modo de chamada**: `Módulo`
**Descrição**: Unidade funcional do sistema que implementa um conjunto específico de funcionalidades relacionadas a um domínio de negócio: por exemplo, Migração de Dados, Gestão de Alunos, Emissão de Documentos, etc.
**Definições técnicas**:
 - Cada módulo possui sua própria interface gráfica, que pode ser acessada através de um Painel (página única) ou Página (múltiplas páginas).
 - Módulos podem interagir entre si através de APIs internas do sistema para compartilhar dados e funcionalidades.

## Painel de [Módulo]
**Categoria**: [Interface de Usuário]
**Modo de chamada**: `Painel de [Módulo]`
**Descrição**: Conforme descrito acima no item NOMENCLATURAS FUNDAMENTAIS, é a interface gráfica do módulo usada em *página única (single page)*.
**Definições técnicas**:
 - O Painel de [Módulo] apresenta-se sob a estrutura de seções colapsáveis, permitindo ao usuário navegar entre diferentes funcionalidades do módulo sem sair da página atual.

### Página de [Módulo]
**Categoria**: [Interface de Usuário]
**Modo de chamada**: `Página de [Módulo]`
**Descrição**: Conforme descrito acima no item NOMENCLATURAS FUNDAMENTAIS, é a interface gráfica do módulo usada em *múltiplas páginas*.
**Definições técnicas**:
 - A Página de [Módulo] é composta por várias páginas interligadas, cada uma dedicada a uma funcionalidade específica do módulo, permitindo uma navegação mais detalhada e segmentada.

### Todos os Alunos
**Categoria**: [Filtro de Dados]
**Modo de chamada**: `Todos os Alunos`
**Descrição**: São todos os alunos registrados no sistema, independentemente de sua situação acadêmica.
**Definições técnicas**:
  *Fonte de dados (Prisma)*: Aluno

### Alunos Concluintes
**Categoria**: [Filtro de Dados]
**Modo de chamada**: `Alunos Concluintes`
**Descrição**: São os alunos que cursaram a última série da Modalidade do Segmento num determinado Ano Letivo/Período Letivo tendo sido APROVADOS.
  - Dessa forma, excluem-se os alunos que estiveram em dependência, foram reprovados, cancelados, etc. A única condição que satisfaz o Aluno Concluinte é a Situação Final ser *APROVADO*.
**Definições técnicas**:
  - A série final de cada Modalidade do Segmento é definida conforme o currículo escolar adotado pela instituição.
  - Se o curso/modalidade for Ensino Médio Reular, a última série será a 3ª série do Ensino Médio.
  - Se o curso/modalidade for Ensino Médio ENEJA, a última série será o 4º módulo do Ensino Médio ENEJA.
  *Fonte de dados (Prisma)*: Aluno.SituacaoFinal = 'APROVADO' E Aluno.Serie = Última Série da Modalidade do Segmento
  // TODO: definir critérios adicionais se necessário

### Alunos Pedentes
**Categoria**: [Filtro de Dados]
**Modo de chamada**: `Alunos Pedentes`
**Descrição**: São os todos os alunos que:
  - (a) são alunos em última série da Modalidade do Segmento num determinado Ano Letivo/Período Letivo;
  - (a) não são Alunos Concluintes;
  - (b) não são Alunos Cancelados;
**Definições técnicas**:
  - Incluem alunos que estão em dependência, foram reprovados, ou estão em outras situações que não sejam "APROVADO" ou "CANCELADO".
  *Fonte de dados (Prisma)*: Aluno.Serie = Última Série da Modalidade do Segmento E Aluno.SituacaoFinal != 'APROVADO' E Aluno.SituacaoFinal != 'CANCELADO'
  // TODO: definir critérios adicionais se necessário

### Alunos Cancelados
**Categoria**: [Filtro de Dados]
**Modo de chamada**: `Alunos Cancelados`
**Descrição**: São os alunos que tiveram sua matrícula cancelada no sistema, independentemente do motivo do cancelamento.
**Definições técnicas**:
  // TODO: definir critérios adicionais se necessário
  *Fonte de dados (Prisma)*: Aluno.SituacaoFinal = 'CANCELADO'

### Turma (Modo Abreviado)
**Categoria**: [Formato de Exibição]
**Modo de chamada**: `Turma (Modo Abreviado)`
**Descrição**: Nome da Turma sem os números após o hífen.
    - Exemplo: "IFB-3003-18981" torna-se "IFB-3003".
**Definições técnicas**:
  *Função utilizada*: [ainda não definida]; // TODO

### Turmas Ordenadas Numericamente
**Categoria**: [Método de Ordenação]
**Modo de chamada**: `Turmas Ordenadas Numericamente`
**Descrição**: Turmas classificadas segundo suas partes numéricas.
    - Exemplo: "IFB-2", "IFB-10", "IFB-100" torna-se "IFB-2", "IFB-10", "IFB-100" (ordem correta) ao invés de "IFB-10", "IFB-100", "IFB-2" (ordem incorreta).
**Definições técnicas**:
  *Função utilizada*: [ainda não definida]; // TODO
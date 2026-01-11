## GLOSSARIO DE HIERARQUIAS
### Navegação Estrutural Múltipla (Breadcrumb) 
**Categoria**: [Navegação Estrutural]
**Modo de chamada**: `Navegação Estrutural Múltipla (Breadcrumb)`
**Descrição**: Estrutura de navegação usada para agrupar e exibir alunos no sistema, facilitando a navegação e a localização de informações específicas.
**Definições técnicas**:
   - Níveis da hierarquia padrão:
       1. Ano Letivo
       2. Segmento
       3. Modalidade
       4. Turma
       5. Aluno
   - Cada nível estará disposto numa visualização horizontal, lado a lado, no formato de "breadcrumbs".
**Versões**:
  - `Alunos, por Ano Letivo até Turmas`
    - Níveis da hierarquia específico:
       1. Ano Letivo (ordem decrescente)
       2. *Modalidade de Segmento*
       3. Se Modalidade de Segmento for "Ensino Médio Regular":
       4. Período Letivo (Alias)?
         - Se `Período Letivo (Alias)` for "Anual", pular este nível
         - Se `Período Letivo (Alias)` for "Primeiro Semestre" ou "Segundo Semestre", exibir este nível
       4. Turma (Modo Abreviado, ordenadas numericamente)
       5. Aluno (grupo final filtrado)
    - O que é "Modalidade de Segmento" está definido abaixo.

### Modalidade de Segmento
**Categoria**: [Item de Navegação Estrutural]
**Modo de chamada**: `Modalidade de Segmento`
**Descrição**: União num único termo de uma Modalidade e um Segmento específico.
    - Exemplo: "Ensino Médio Regular" é uma Modalidade de Segmento que une a Segmento "Ensino Médio" com a Modalidade "Regular".
    
### Navegação Estrutural Múltipla (Breadcrumb): Modalidade de Segmento
**Categoria**: [Navegação Estrutural]
**Modo de chamada**: `Navegação Estrutural Múltipla (Breadcrumb): Modalidade de Segmento`
**Descrição**: VARIAÇÃO DE `Navegação Estrutural Múltipla (Breadcrumb)`.


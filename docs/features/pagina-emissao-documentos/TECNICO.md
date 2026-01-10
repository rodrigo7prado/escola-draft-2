*Para uso da IA*
Para quaisquer termos começando com letra maiúscula, certifique-se de conhecer seu significado exato consultando os glossários em [glossários](./../../../.ai/glossario/*) e outros arquivos de glossário relacionados.

[ ] TEC1: Estrutura Geral
- Estilo de UI Ultra-Compacto;

[ ] TEC2: Parte superior
- A Página de Emissão de Documentos deve permitir a busca por nome do aluno ou matrícula
- O modo será Campo de Pesquisa com Autocompletar com Coringa;

[ ] TEC3: BARRA LATERAL ESQUERDA
- Lista dos alunos: Alunos Concluintes
 - Alunos serão agupados por Hierarquia de Listagem de Alunos (Modalidade)
    - Inicialmente, a única Modalidade de Curso existente será "Ensino Médio Regular".
- As turmas serão exibidas em Modo Abreviado;
- Turmas Ordenadas Numericamente;

[ ] TEC4: BLOCO DE CONTEÚDO PRINCIPAL
- Ainda a definir...

## TEC5: Menu principal global para navegação entre módulos

**Motivação:**
Disponibilizar acesso rápido e consistente às páginas principais, com layout ultra-compacto no topo.

**Alternativas Consideradas:**
- ❌ Menu lateral dedicado por página: aumenta ruído visual e duplica navegação.
- ❌ Navegação somente por links internos: dificulta o acesso direto aos módulos.
- ✅ Menu global no `layout.tsx`: centraliza a navegação e mantém consistência visual.

**Referências no Código:**
- `src/app/layout.tsx` - Barra superior com links de navegação.

## ARQUIVOS INCLUÍDOS
Quanto aos próximos arquivos incluídos, nunca pergunte se deve lê-los, a leitura é obrigatória.
- @include .ai/CORE.md [CORE.md](.ai/CORE.md)
- @include .ai/ARQUITETURA_PROJETO.md [ARQUITETURA_PROJETO.md](.ai/ARQUITETURA_PROJETO.md)
- @include .ai/glossario/* [glossario](.ai/glossario/*) - neste caso, incluir todos os arquivos do diretório glossario

## METODOLOGIAS DE DOCUMENTAÇÃO (COEXISTÊNCIA)

Este projeto usa **duas metodologias** de documentação:

### Metodologia IDD/DRY (Features Antigas)
- Localização: `docs_deprecated/`
- Features: importacao-por-colagem, sistema-fases-gestao-alunos, importacao-ficha-individual-historico, emissao-documentos
- Usa: CHECKPOINT.md, TECNICO.md com prefixos TEC*, tags [FEAT:*_TEC*] no código
- Referência: `docs_deprecated/IDD.md`

### Metodologia IDD Simplificada (Novas Features)
- Localização: `docs/`
- Features: pagina-emissao-documentos + todas as novas
- Usa: FLUXO.md + TECNICO.md, `Termos` em crases, sem checkpoints, sem prefixos
- Referência: `docs/IDD.md`

### Glossário (Compartilhado)
- Localização: `.ai/glossario/*.md`
- SSOT para termos de domínio
- Metodologia simplificada: usar `Termos` entre crases (ex.: `Lista de Alunos Concluintes`)
- Metodologia antiga: termos com Maiúscula

## COMUNICAÇÃO E COLABORAÇÃO

1. **Comunicação:** conversar sempre em português, com tom acolhedor e explicando cada passo com clareza.
2. Restrinja-se aos arquivos que forem indicados no fluxo de arquivos referenciados desde AGENTS.md. Evite invocar arquivos por conta própria.

## METODOLOGIA DE DESENVOLVIMENTO

**Para features novas (pagina-emissao-documentos em diante):**
- Glossário como SSOT: `.ai/glossario/*.md`
- Usar `Termos` entre crases na documentação
- Consultar `docs/IDD.md` para metodologia completa

**Para features antigas:**
- Continuar usando estrutura DRY em `docs_deprecated/dry/*`
- Consultar `docs_deprecated/IDD.md` para metodologia completa

## Codex (Especialista em Implementação)

**Responsabilidade Principal:** Código-fonte e testes

### Atribuições Específicas:
- **Implementações:**
  - Features, componentes, hooks, lógica de negócio
  - Features antigas: seguir checkpoints fornecidos pelo Claude
  - Features novas: seguir FLUXO.md fornecido pelo Claude

- **Documentação Técnica:**
  - **Features novas:** `TECNICO.md` em prosa natural, com `Termos` em crases e sem prefixos
  - **Features antigas:** `TECNICO.md` com prefixos TEC* e tags [FEAT:*_TEC*] no código
  - Manter rastreabilidade código ↔ documentação técnica via referências (arquivo:linha)

- **Testes:**
  - Unitários, integração, E2E
  - Cobertura e qualidade do código

### Workflow do Codex:
**Para features novas (metodologia simplificada):**
1. Recebe FLUXO.md do Claude
2. Consulta glossário `.ai/glossario/*` para entender `Termos` usados
3. Implementa features baseado em FLUXO.md
4. Cria/atualiza TECNICO.md com decisões de implementação real
5. Reporta ao Claude para validação documental

**Para features antigas (metodologia IDD/DRY):**
1. Recebe CHECKPOINT.md do Claude
2. Implementa baseado nos checkpoints
3. Atualiza TECNICO.md com decisões, usando prefixos TEC*
4. Adiciona tags [FEAT:nome-feature_TEC*] no código
5. Marca checkpoints como concluídos
6. Reporta ao Claude para atualização documental

### Refatorações com base em TECNICO.md
Sempre que for pedida uma refatoração baseada em TECNICO.md:
1. Reanalise todo o conjunto
2. Refatore apenas as diferenças
3. Não escreva nada mais em TECNICO.md.

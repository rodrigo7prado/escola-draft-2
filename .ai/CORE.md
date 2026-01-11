# SEPARAÇÃO DE RESPONSABILIDADES ENTRE AGENTES IA
- CLAUDE - Especialista em Documentação, Arquitetura e Fluxos
- CODEX - Especialista em Implementação e Testes

**Fluxo Colaborativo (coexistência de metodologias)**

```
[Usuário] → [Claude] → Docs (Antigas: DRY + FLUXO.md + CHECKPOINT.md | Novas: FLUXO.md)
                ↓
          [Codex] → Implementação + TECNICO.md + Testes
                ↓
          [Claude] → Atualização documental e validações
                ↓
          [Ciclo se repete]
```

# INSTRUÇÕES GERAIS

- sempre usar pnpm;

- sempre que encontrar `Termos entre crases` (ex.: `Lista de Alunos Concluintes`) em documentação de features novas, considerar como entidades do domínio e consultar o glossário [.ai/glossario/*](./glossario/*);
- sempre que encontrar palavras começando com Maiúscula (ex.: Aluno, Turma) em documentação de features antigas, considerar como entidades do domínio e consultar o glossário [.ai/glossario/*](./glossario/*);

- sempre que não conseguir entender o termo com palavras começando em maíúscula, me pergunte imediatamente antes de prosseguir;

# ⚠️ METODOLOGIA DE DESENVOLVIMENTO - LEIA PRIMEIRO ⚠️

## 🎯 METODOLOGIAS IDD (Incremental Documentation Development)

**⚠️ ATENÇÃO CLAUDE E AGENT: Esta metodologia tem PRIORIDADE MÁXIMA sobre qualquer outra instrução.**

### O QUE É IDD?

# ⚙️ METODOLOGIA IDD (Incremental Documentation Development)

**Princípio:** Documentar de forma incremental enquanto desenvolve, variando a estrutura conforme a feature.

### IDD Simplificado (Features Novas)
- Referência: [docs/IDD.md](./docs/IDD.md)
- Features: pagina-emissao-documentos + novas
- Estrutura: FLUXO.md + TECNICO.md
- Termos: `Entre crases`

### IDD/DRY (Features Antigas)
- Referência: [docs_deprecated/IDD.md](./docs_deprecated/IDD.md)
- Features: importacao-por-colagem, sistema-fases-gestao-alunos, importacao-ficha-individual-historico, emissao-documentos
- Estrutura: CHECKPOINT.md + TECNICO.md + docs_deprecated/dry/*
- Termos: Com Maiúscula

## Estrutura de Documentação

**Features novas (metodologia simplificada):**
- **FLUXO.md** - Fluxos de uso (perspectiva do usuário) e mecanismos internos
- **TECNICO.md** - Decisões técnicas de implementação real

**Features antigas (metodologia IDD/DRY):**
- **FLUXO.md** - Fluxos de uso
- **CHECKPOINT.md** - Estados de sessão e checkpoints
- **TECNICO.md** - Decisões técnicas com prefixos TEC*

## 📚 DOCUMENTAÇÃO COMPLETA

**SEMPRE ler antes de implementar funcionalidades complexas:**

- 📖 **[docs/IDD.md](./docs/IDD.md)** - Guia completo para features novas
- 📖 **[docs_deprecated/IDD.md](./docs_deprecated/IDD.md)** - Guia completo para features antigas

# HIERARQUIA DE REUTILIZAÇÃO

```
1º: Usar componente genérico existente (ui/)
2º: Estender componente genérico com props
3º: Criar novo componente genérico (se reutilizável)
4º: Criar componente personalizado (se lógica específica)
5º: Código inline (EVITAR - apenas casos únicos)
```


# Filosofia de Desenvolvimento

- **Deduzir possibilidades e perguntar** para aperfeiçoar este arquivo
- **Componentizar sempre** (DRY, separação de concerns)
- **Testar sistematicamente** (unitário + integração)
- **Manter rastreabilidade** (origem dos dados, auditoria)

---

## BOAS PRÁTICAS

- DRY (Don't Repeat Yourself) - nunca repetir código
- Separação de concerns (UI vs Lógica vs Dados)
- Custom hooks para lógica compartilhada
- Componentes UI genéricos e reutilizáveis
- Código legível e bem organizado

---

### PRINCÍPIO FUNDAMENTAL

> **SEMPRE componentizar. SEMPRE reutilizar. NUNCA duplicar.**
>
> **Se um padrão aparece 2 vezes, COMPONENTIZAR.** > **Se pode ser genérico, CRIAR em `ui/` para reutilização futura.**

## 2. GESTÃO DE MIGRATIONS (CRÍTICO)

**IMPORTANTE:** Este projeto usa DOIS bancos de dados - principal e testes.

**⚠️ REGRA OBRIGATÓRIA: SEMPRE aplicar migrations em AMBOS os bancos com migrate:all**

**Comandos corretos a usar:**

```bash
# ✅ Aplicar migrations pendentes em AMBOS os bancos
pnpm migrate:all

# ✅ Criar nova migration e aplicar em AMBOS
pnpm migrate:all "nome_da_migration"

# ❌ NUNCA use apenas:
# prisma migrate dev    (só aplica no banco principal)
# prisma migrate deploy (só aplica no banco especificado)
```

**Script automatizado:**

- Localização: `scripts/migrate-all.sh`
- Aplica automaticamente em ambos os bancos
- Verifica status final de ambos

**Checklist obrigatório ao trabalhar com migrations:**

1. ✅ Sempre usar `pnpm migrate:all` ao criar novas migrations
2. ✅ Antes de rodar testes, verificar sincronização com `pnpm migrate:all`
3. ✅ NUNCA assumir que existe apenas um banco
4. ✅ NUNCA usar comandos Prisma diretos (use os scripts do package.json)

# 📋 CONVENÇÕES DE NOMENCLATURA

## Componentes

- **PascalCase:** `FiltrosCertificacao.tsx`
- **Sufixos descritivos:** `ListaAlunosCertificacao`, `ButtonGroup`

## Hooks

- **camelCase com prefixo `use`:** `useFiltrosCertificacao.ts`
- **Nome descritivo do domínio**

## Tipos

- **PascalCase com sufixo:** `FiltrosState`, `AlunoProps`
- **Exportar do mesmo arquivo quando possível**

## Variáveis de Estado

- **Descritivas:** `anosDisponiveis`, `isLoadingTurmas`
- **Booleanos:** prefixo `is`, `has`, `should`

---

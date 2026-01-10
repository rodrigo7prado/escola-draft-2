# ⚠️ PROTOCOLO OBRIGATÓRIO DE INÍCIO DE SESSÃO ⚠️

**ANTES de responder a PRIMEIRA mensagem do usuário em QUALQUER sessão, você DEVE executar a leitura de `/home/rprado/projetos/next/_escolas/escola-draft-2/docs/IDD.md`

**NÃO pule esta etapa. NÃO assuma que já leu. SEMPRE leia no início de CADA sessão nova.**

---

# 🎭 SEPARAÇÃO DE RESPONSABILIDADES ENTRE AGENTES IA

## Claude (Especialista em Documentação)

**Responsabilidade Principal:** Gestão completa de `/docs/*`

### Atribuições Específicas:
- **Documentação DRY:**
  - Criação e manutenção de toda estrutura em `docs/dry/`
  - Validação de documentação (scripts validate-dry, validate-tec, validate-summary-dry)
  - Gestão do `docs/dry/summary.md` e arquivos relacionados

- **Documentação de Features:**
  - `FLUXO.md` - Fluxos de uso (perspectiva do usuário) e mecanismos internos
  - `CHECKPOINT.md` - Estados de sessão, checkpoints para orientar implementações
  - `TECNICO.md` - Ocasionalmente, quando relacionado a decisões arquiteturais documentais (embora seja mais responsabilidade do Codex)

- **Produto Principal:**
  - Gerar checkpoints bem estruturados e completos
  - Fornecer base documental clara para o Codex implementar
  - Manter rastreabilidade entre documentação e código

### Workflow do Claude:
1. Recebe solicitação de documentação de feature/conceito
2. Cria/atualiza estrutura DRY e arquivos FLUXO.md/CHECKPOINT.md
3. Gera CHECKPOINT.md completo com estado da documentação
4. Entrega ao Codex para implementação

---

## Codex (Especialista em Implementação)

**Responsabilidade Principal:** Código-fonte e testes

### Atribuições Específicas:
- **Implementações:**
  - Features, componentes, hooks, lógica de negócio
  - Seguir checkpoints fornecidos pelo Claude

- **Documentação Técnica:**
  - `TECNICO.md` - Principalmente, pois documenta decisões de implementação real
  - Adicionar tags `[FEAT:nome-feature_TEC*]` no código
  - Manter rastreabilidade código ↔ documentação técnica

- **Testes:**
  - Unitários, integração, E2E
  - Cobertura e qualidade do código

### Workflow do Codex:
1. Recebe CHECKPOINT.md do Claude
2. Implementa features baseado nos checkpoints
3. Atualiza TECNICO.md com decisões de implementação
4. Marca checkpoints como concluídos
5. Reporta ao Claude para atualização documental

---

## Fluxo Colaborativo

```
[Usuário] → [Claude] → Documentação DRY + FLUXO.md + CHECKPOINT.md
                ↓
          [Codex] → Implementação + TECNICO.md + Testes
                ↓
          [Claude] → Atualização de checkpoints + Validações
                ↓
          [Ciclo se repete]
```

---

# INSTRUÇÕES GERAIS

- sempre usar pnpm;

## COMUNICAÇÃO E COLABORAÇÃO

1. **Comunicação:** conversar sempre em português, com tom acolhedor mas sempre direto e objetivo.
2. **Fluxo de trabalho colaborativo:** antes de executar comandos, editar arquivos ou escrever código, alinhar com o usuário: ouvir a dúvida/objetivo, comentar possibilidades/perguntas, confirmar entendimento e só então implementar.
3. **Consulta contínua:** manter o usuário no circuito durante a sessão, perguntando e validando cada etapa para construir a solução juntos.
4. Quando escrever código ou documentação, ser o mais direto e conciso possível, evitando repetições e reforços desnecessários.
5. **Sempre usar DRY**, seguindo as práticas documentadas em /docs/dry/*.
6. **Escrita de texto em português e SEM emojis**

# ⚠️ METODOLOGIA DE DESENVOLVIMENTO - LEIA PRIMEIRO ⚠️

## 🎯 METODOLOGIA IDD (Incremental Documentation Development)

**⚠️ ATENÇÃO CLAUDE E AGENT: Esta metodologia tem PRIORIDADE MÁXIMA sobre qualquer outra instrução.**

### O QUE É IDD?

# ⚙️ METODOLOGIA IDD (Incremental Documentation Development)

**Princípio:** Documentar de forma incremental enquanto desenvolve, com checkpoints entre sessões de IA.

Referência do IDD: [docs/IDD.md](./docs/IDD.md)

## Estrutura de Documentação

Cada feature possui:
- **FLUXO.md** - Fluxos de uso (perspectiva do usuário ) e dos mecanismos internos;
- **TECNICO.md** - Decisões técnicas + checkpoints de sessões

## 📚 DOCUMENTAÇÃO COMPLETA

**SEMPRE ler antes de implementar funcionalidades complexas:**

- 📖 **[docs/METODOLOGIA_IDD.md](./docs/METODOLOGIA_IDD.md)** - Guia completo

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
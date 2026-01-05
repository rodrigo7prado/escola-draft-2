# Ferramenta de Validação DRY

## Objetivo

Validar automaticamente a documentação DRY em `/docs/dry/`, garantindo consistência e integridade das referências entre documentos.

## Como Usar

```bash
pnpm validate:dry
```

## O que é Validado

### 1. Referências de IDs DRY

Verifica se todos os IDs DRY referenciados estão definidos em algum lugar da documentação.

**Exemplo de erro:**
```
❌ ID DRY referenciado mas não definido: "DRY.UI:BOTAO_SALVAR"
   Arquivo: docs/dry/ui/ui-components.dry.md:42
   💡 Defina o ID usando: *`DRY.UI:BOTAO_SALVAR`* em algum arquivo DRY
```

### 2. Duplicação de IDs

Detecta quando o mesmo ID DRY é definido em múltiplos lugares.

**Exemplo de erro:**
```
❌ ID DRY duplicado: "DRY.UI:MODAL_INFO_UPLOAD" (2 definições)
   Arquivo: docs/dry/ui/ui-base.dry.md:19, docs/dry/ui/ui-components.dry.md:21
   💡 Mantenha apenas uma definição ou use IDs únicos
```

### 3. Links Markdown Quebrados

Valida se todos os links internos apontam para arquivos existentes.

**Exemplo de aviso:**
```
⚠️  Link quebrado: "DRY.CONCEPT:ITEM_ALUNO" aponta para "ui/ui-macro.md#item_aluno"
   Arquivo: docs/dry/summary.md:10
   💡 Verifique se o caminho está correto ou se o arquivo foi movido
```

## Formato de IDs DRY

A ferramenta reconhece os seguintes padrões:

### Definições (obrigatório usar um destes formatos):

```markdown
*`DRY.UI:NOME_DO_COMPONENTE`*
`DRY.CONCEPT:NOME_DO_CONCEITO`
**`DRY.BACKEND:NOME_DO_RECURSO`**
```

### Referências (podem ser usadas em qualquer lugar):

```markdown
[DRY.UI:NOME_DO_COMPONENTE]
DRY.CONCEPT:NOME_DO_CONCEITO
```

## Estrutura de Categorias Suportadas

- `DRY.UI:*` - Componentes de interface
- `DRY.CONCEPT:*` - Conceitos de domínio
- `DRY.BACKEND:*` - Recursos de backend
- `DRY.BASE-UI:*` - Componentes base de UI
- Outros prefixos podem ser adicionados conforme necessário

## Saída do Comando

### Relatório de Estatísticas

```
📊 ESTATÍSTICAS
────────────────────────────────────────────────────────────
Arquivos analisados:     8
IDs únicos definidos:    15
Total de definições:     15
Total de referências:    23
```

### Lista de IDs Definidos

```
📚 IDs DRY DEFINIDOS
────────────────────────────────────────────────────────────
  DRY.BACKEND:IMPORT_PROFILE
    └─ docs/dry/backend/imports/import-profile/backend.dry.md:2
  DRY.CONCEPT:BARRA_RESUMO_ALUNOS
    └─ docs/dry/ui/ui-macro.md:10
  DRY.CONCEPT:DADOS_DO_ALUNO
    └─ docs/dry/ui/ui-macro.md:15
  ...
```

## Código de Saída

- `0` - Validação bem-sucedida (sem erros)
- `1` - Validação falhou (erros encontrados)

Isso permite integrar a validação em pipelines de CI/CD:

```bash
# Exemplo de uso em CI
pnpm validate:dry || exit 1
```

## Integração com Git Hooks

Você pode adicionar a validação ao pre-commit para evitar commits com referências quebradas:

```bash
# .husky/pre-commit
pnpm validate:dry
```

## Boas Práticas

1. **Execute antes de cada commit** de mudanças na documentação DRY
2. **Fixe erros imediatamente** - não acumule referências quebradas
3. **Use IDs descritivos** - facilita encontrar e reutilizar componentes
4. **Documente uma única vez** - evite duplicar definições
5. **Mantenha o summary.md atualizado** - é o ponto de entrada principal

## Exemplos de Correções

### Erro: ID não definido

**Problema:**
```markdown
<!-- Em docs/dry/ui/ui-components.dry.md -->
Utilize o componente [DRY.UI:BOTAO_ACAO]
```

**Solução:**
```markdown
<!-- Adicione a definição em docs/dry/ui/ui-base.dry.md -->
#### *`DRY.UI:BOTAO_ACAO`*
  - Descrição: Botão genérico para ações
  - Localização: /src/components/ui/BotaoAcao.tsx
```

### Erro: ID duplicado

**Problema:**
```markdown
<!-- Em ui-base.dry.md -->
#### *`DRY.UI:MODAL_INFO`*

<!-- Em ui-components.dry.md -->
#### *`DRY.UI:MODAL_INFO`*
```

**Solução:**
Escolha um arquivo para manter a definição e remova do outro, ou use IDs mais específicos:
```markdown
<!-- Em ui-base.dry.md -->
#### *`DRY.UI:MODAL_INFO_BASE`*

<!-- Em ui-components.dry.md -->
#### *`DRY.UI:MODAL_INFO_UPLOAD`*
```

### Aviso: Link quebrado

**Problema:**
```markdown
[Componente](ui/componentes.md)  <!-- Arquivo não existe -->
```

**Solução:**
```markdown
[Componente](ui/ui-components.dry.md)  <!-- Caminho correto -->
```

## Limitações Conhecidas

1. **Âncoras não são validadas** - apenas a existência do arquivo, não as seções
2. **Links externos não são validados** - apenas links internos relativos
3. **Case sensitive** - IDs devem usar maiúsculas conforme padrão

## Roadmap Futuro

- [ ] Validação de âncoras em links markdown
- [ ] Sugestões automáticas de correção
- [ ] Geração automática do summary.md
- [ ] Integração com VSCode (extension)
- [ ] Validação de convenções de nomenclatura
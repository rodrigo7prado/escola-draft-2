---
description: Valida e corrige automaticamente o docs/dry/summary.md
---

Você deve validar e **CORRIGIR AUTOMATICAMENTE** o arquivo `docs/dry/summary.md`.

## Processo Automático de Correção

### 1. Sincronizar Hierarquia de Arquivos

- Listar TODOS os arquivos `.dry.md` no diretório `docs/dry/` recursivamente
- Adicionar ao `summary.md` quaisquer arquivos que estejam faltando
- Remover do `summary.md` referências a arquivos que não existem mais

### 2. Corrigir URLs e Âncoras

Para cada link no `summary.md`:
- Extrair o arquivo de destino e a âncora esperada
- Ler o arquivo de destino e encontrar TODAS as âncoras válidas
- Se a âncora não existir, substituir pela âncora correta mais próxima
- Atualizar o link no `summary.md` com a URL correta
- Atente-se para a necessidade de hífens duplicados, como em `#--1-`. Somente assim o link funcionará corretamente.

### 3. Corrigir Estrutura e Numeração

- Renumerar sequencialmente todos os itens (1, 2, 3, etc.)
- Padronizar nomes de componentes DRY entre summary e arquivos
- Remover duplicações mantendo apenas a primeira ocorrência

### 4. Reorganizar por Hierarquia

Organizar o `summary.md` seguindo esta estrutura:
```
## [Categoria Principal]
### [Subcategoria]
- [Item 1]
- [Item 2]
```

### 5. Executar Correções

**IMPORTANTE:**
- Executar TODAS as correções necessárias automaticamente
- Reescrever o `summary.md` com a versão corrigida
- Mostrar um resumo do que foi corrigido ao final
- NÃO pedir confirmação - simplesmente corrigir tudo

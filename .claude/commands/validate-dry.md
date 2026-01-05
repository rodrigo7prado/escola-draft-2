---
description: Valida a documentação DRY e reporta erros
---

Você deve executar a validação completa da documentação DRY localizada em `docs/dry/`.

## Objetivo

Verificar a integridade da documentação DRY, garantindo que:
- Todos os IDs DRY referenciados estão definidos
- Não há duplicação de IDs
- Todos os links markdown internos funcionam
- Todas as âncoras em links apontam para seções existentes

## Processo de Validação

### 1. Executar o Script de Validação

Execute o comando:
```bash
pnpm validate:dry
```

### 2. Analisar Resultado

O script reportará:
- **Estatísticas gerais** (arquivos analisados, IDs definidos, referências)
- **Erros** (IDs não definidos, duplicações)
- **Avisos** (links quebrados, âncoras não encontradas)
- **Lista de IDs DRY** definidos com suas localizações

### 3. Reportar ao Usuário

Se houver erros ou avisos:
- Mostre o relatório completo ao usuário
- Explique cada erro/aviso de forma clara
- Sugira correções específicas

Se não houver problemas:
- Confirme que a documentação está válida
- Mostre as estatísticas

## Tipos de Problemas Detectados

### Erros (exit code 1)

1. **ID DRY não definido**
   - Um ID é referenciado mas não existe definição
   - Exemplo: `[DRY.UI:BOTAO_NOVO]` mas não há `*\`DRY.UI:BOTAO_NOVO\`*`

2. **ID DRY duplicado**
   - O mesmo ID está definido em múltiplos lugares
   - Manter apenas uma definição

### Avisos (exit code 0)

1. **Link quebrado**
   - Link aponta para arquivo que não existe
   - Verificar caminho relativo/absoluto

2. **Âncora não encontrada**
   - Arquivo existe mas seção não
   - Atualizar âncora para corresponder ao título real

## Formato de IDs DRY

### Definições (obrigatório usar um destes formatos):
```markdown
#### *`DRY.UI:NOME_COMPONENTE`*
- [ ] *`DRY.CONCEPT:NOME_CONCEITO`*
*`DRY.BACKEND:NOME_RECURSO`*
```

### Referências (podem ser usadas em qualquer lugar):
```markdown
[DRY.UI:NOME_COMPONENTE]
Aplicar: [DRY.BASE-UI:COMPONENTE_BASE]
```

## Categorias Suportadas

- `DRY.UI:*` - Componentes de interface
- `DRY.CONCEPT:*` - Conceitos de domínio (painéis, fluxos)
- `DRY.BACKEND:*` - Recursos de backend
- `DRY.BASE-UI:*` - Componentes base de UI
- Outras podem ser adicionadas conforme necessário

## Após Validação

Se houver erros:
1. Ofereça corrigir automaticamente (se possível)
2. Ou instrua o usuário sobre como corrigir manualmente

**NÃO** execute correções sem confirmar com o usuário primeiro.
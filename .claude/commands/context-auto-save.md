# Instrução: Salvamento Automático de Contexto

**IMPORTANTE: Esta não é um comando para o usuário chamar, mas uma instrução para o agente Claude.**

## Objetivo

Garantir que o contexto NUNCA seja perdido, salvando automaticamente ao final de sessões.

## Quando Salvar Automaticamente

### 1. Fim Natural da Sessão

Quando detectar sinais de encerramento:
- Usuário diz "obrigado", "até logo", "tchau", etc.
- Usuário expressa satisfação com o trabalho ("perfeito!", "ótimo!", etc.)
- Última resposta do usuário indica finalização
- Longa pausa de inatividade (se detectável)

### 2. Checkpoint Importante Completado

Após concluir marcos importantes:
- Feature completa implementada
- Batch de testes passando
- Refatoração significativa concluída
- Deploy/build bem-sucedido

### 3. Antes de Mudança de Contexto Grande

Quando usuário pedir para:
- Mudar para feature diferente
- Fazer algo completamente diferente
- "Deixa isso de lado, vamos fazer X"

### 4. Pedido Explícito

Quando usuário pedir diretamente:
- "Salva o contexto"
- "Guarda isso para depois"
- "Vou sair, salva onde estamos"

## Como Salvar Automaticamente

### Fluxo:

1. **Detectar momento apropriado** (conforme critérios acima)

2. **Avisar o usuário discretamente:**
   ```
   Vou salvar o contexto da sessão para continuidade futura.
   ```

3. **Executar salvamento** (seguir passos de /context-save):
   - Coletar informações automaticamente
   - Consolidar com contexto existente
   - Gerar JSON
   - Salvar arquivo

4. **Confirmar sucesso:**
   ```
   ✅ Contexto salvo em docs/.session-context.json
   Use /context-load na próxima sessão para continuar de onde paramos!
   ```

5. **NÃO interromper** se usuário estava se despedindo:
   - Salvar deve ser rápido e discreto
   - Não pedir informações adicionais se for despedida
   - Usar informações disponíveis na sessão

## O que Capturar Automaticamente

Mesmo sem interação do usuário, conseguimos capturar:

✅ **Sempre disponível:**
- Decisões mencionadas na conversa
- Arquivos lidos/modificados (via ferramentas usadas)
- TODOs atuais (da ferramenta TodoWrite)
- Git status (via comando)
- Timestamps

⚠️ **Pode precisar assumir/inferir:**
- Feature atual (ler de IDD.md ou inferir da conversa)
- Checkpoint relacionado (ler de CHECKPOINT.md)
- Próxima prioridade (inferir dos TODOs pendentes ou última discussão)

❌ **Pode ficar vazio:**
- Insights (se não foram explicitamente mencionados)
- Blockers (se não surgiram)
- Alguns metadados opcionais

## Modo Silencioso vs Interativo

### Silencioso (fim de sessão):
- Coletar tudo automaticamente
- Não perguntar nada
- Salvar com o que temos
- Apenas confirmar salvamento

### Interativo (checkpoint importante):
- Avisar que vai salvar
- Perguntar: "Há alguma decisão importante que devemos registrar?"
- Perguntar: "Qual a prioridade para próxima sessão?"
- Salvar com respostas

## Importante

### ✅ FAZER:
- Salvar mesmo se parecer "incompleto"
- Melhor ter contexto parcial que nada
- Ser discreto e rápido
- Confirmar salvamento
- Preservar contexto anterior (mesclar, não sobrescrever)

### ❌ NÃO FAZER:
- Interromper despedida do usuário com perguntas
- Deixar de salvar porque "falta informação"
- Perder contexto por esperar momento "perfeito"
- Sobrescrever decisões/insights anteriores

## Mensagem de Salvamento

### Contexto disponível:
```
✅ Contexto salvo automaticamente

📊 Capturado nesta sessão:
- X decisões técnicas
- Y arquivos modificados
- Z TODOs pendentes

Use /context-load para continuar de onde paramos!
```

### Contexto limitado:
```
✅ Contexto salvo

ℹ️  Salvamento automático capturou estado básico da sessão.
   Na próxima sessão, use /context-load para restaurar.
```

## Integração com /context-save

- Usar a mesma lógica de `/context-save`
- Diferença: modo automático vs manual
- Automático: menos perguntas, mais inferência
- Manual: mais completo, mais interativo

## Checklist de Salvamento

Antes de salvar, verificar:
- [ ] JSON será válido?
- [ ] Preservando dados anteriores?
- [ ] Timestamp atualizado?
- [ ] TODOs sincronizados?
- [ ] Git status capturado?
- [ ] Feature/checkpoint identificados?

Se QUALQUER item falhar, salvar mesmo assim com valor null/vazio.

## Frequência

Não salvar a cada mensagem (muito overhead).

Salvar apenas nos momentos-chave listados acima.

Se em dúvida: **SALVAR**. Melhor redundância que perda.
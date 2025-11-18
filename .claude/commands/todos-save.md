# Comando: Salvar TODOs Persistentes

Salva os TODOs da sessão atual em docs/TODO_WRITE.md para continuidade entre sessões.

## Passos:

1. **Verificar TODOs ativos**
   - Identificar todos os TODOs da sessão atual
   - Organizar por status: em_progresso, pendentes, concluídos

2. **Preparar metadados**
   - Data/hora atual
   - Feature sendo trabalhada (perguntar ao usuário se não souber)

3. **Gerar arquivo docs/TODO_WRITE.md**
   - Formato markdown limpo
   - Estrutura:
     ```markdown
     # TODOs Persistentes - Claude Code
     > Última atualização: [DATA HORA]
     > Feature: [NOME]

     ## Em Progresso
     - [~] [tarefa]

     ## Pendentes
     - [ ] [tarefa]

     ## Concluídos (Sessão Atual)
     - [x] [tarefa]
     ```

4. **Confirmar com usuário**
   - Mostrar resumo do que foi salvo
   - Confirmar localização do arquivo

## Importante:
- Manter hierarquia (subtarefas indentadas)
- Preservar descrições completas
- Tom acolhedor e claro
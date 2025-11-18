# Comando: Carregar TODOs Persistentes

Carrega TODOs salvos de docs/TODO_WRITE.md para continuar trabalho de sessão anterior.

## Passos:

1. **Verificar se arquivo existe**
   - Checar se docs/TODO_WRITE.md existe
   - Se não existir, informar usuário (nenhum TODO salvo ainda)

2. **Ler e parsear arquivo**
   - Extrair metadados (data, feature)
   - Identificar TODOs por status:
     - Em Progresso: [~]
     - Pendentes: [ ]
     - Concluídos: [x]
   - Manter hierarquia (subtarefas)

3. **Recriar TodoWrite na sessão atual**
   - Usar ferramenta TodoWrite
   - Preservar exatamente os mesmos TODOs
   - Manter status correto

4. **Informar usuário**
   - Mostrar resumo do que foi carregado
   - Quantos pendentes, em progresso, concluídos
   - Feature relacionada
   - Data da última atualização

5. **Perguntar ao usuário**
   - "Quer continuar de onde parou ou ajustar algo?"
   - "Algum TODO deve ser removido ou adicionado?"

## Importante:
- Tom acolhedor
- Dar visibilidade do que foi recuperado
- Permitir ajustes antes de começar
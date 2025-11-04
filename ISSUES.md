# ISSUES TÉCNICAS DO SISTEMA

Registro de problemas identificados para resolução gradual.

---

## PAINEL DE MIGRAÇÃO

### 🔴 CRÍTICO #1: Dados não sincronizados entre frontend e backend
**Status:** ✅ Resolvido (2025-01-04)
**Prioridade:** Alta
**Impacto:** Visualização de turmas/modalidades completamente quebrada

**Descrição:**
- API GET `/api/files` retorna `linhas` com `dadosOriginais` completos
- Frontend recebe os dados mas descarta tudo, criando arrays vazios:
  ```typescript
  const arquivosAdaptados = arquivos.map((arq: any) => ({
    anos: [],         // ← Deveria vir da API
    modalidades: [],  // ← Deveria vir da API
    turmas: [],       // ← Deveria vir da API
    data: { headers: [], rows: [] } // ← Deveria vir da API
  }));
  ```
- Depois tenta reconstruir localmente lendo `file.data.rows` que está vazio
- Resultado: Tabs de Períodos/Modalidades/Turmas não aparecem

**Localização:**
- [MigrateUploads.tsx:58-68](src/components/MigrateUploads.tsx#L58-L68)
- [MigrateUploads.tsx:239-309](src/components/MigrateUploads.tsx#L239-L309)

**Possível solução:**
1. **Opção A:** API retorna dados já processados (anos, modalidades, turmas)
2. **Opção B:** Frontend usa `arquivo.linhas` para reconstruir estrutura
3. **Opção C:** Remover visualização hierárquica e usar outra abordagem

---

### 🔴 CRÍTICO #2: Modal exibe "0 registros" sempre
**Status:** ✅ Resolvido (2025-01-04) - Modal removido, substituído por visualização hierárquica
**Prioridade:** Alta
**Impacto:** Usuário não consegue ver quantos registros foram importados

**Descrição:**
- Modal de arquivos mostra `file.data.rows.length` registros
- Como `file.data.rows` está vazio (Issue #1), sempre mostra 0
- Deveria mostrar a contagem real de linhas importadas

**Localização:**
- [MigrateUploads.tsx:398](src/components/MigrateUploads.tsx#L398)

**Possível solução:**
- Usar `file._count.linhas` que vem da API ou `file.rowCount`

---

### 🔴 CRÍTICO #3: Funções de delete por período/modalidade quebradas
**Status:** ✅ Resolvido (2025-01-04) - Implementado delete por período com confirmação textual
**Prioridade:** Alta
**Impacto:** Usuário não consegue deletar dados por período ou modalidade

**Descrição:**
- `removeByPeriodo()` e `removeByModalidade()` filtram por `file.anos` e `file.modalidades`
- Como esses arrays estão vazios (Issue #1), o filtro nunca remove nada
- A API até executa o DELETE, mas o estado local não atualiza corretamente

**Localização:**
- [MigrateUploads.tsx:157-203](src/components/MigrateUploads.tsx#L157-L203)

**Possível solução:**
- Após DELETE na API, recarregar lista completa com GET
- Ou corrigir Issue #1 primeiro

---

### 🟡 MÉDIA #4: Duplicação de lógica de parsing de prefixos
**Status:** ✅ Resolvido (2025-01-04) - Parsing centralizado no backend, frontend removido
**Prioridade:** Média
**Impacto:** Manutenção difícil, risco de inconsistência

**Descrição:**
- Duas implementações diferentes para remover prefixos:
  1. `stripLabelPrefix` (frontend) - usa regex genérica
  2. `limparValor` (backend) - exige prefixo exato como parâmetro
- Lógicas diferentes podem gerar resultados inconsistentes

**Localização:**
- Frontend: [MigrateUploads.tsx:244-246](src/components/MigrateUploads.tsx#L244-L246)
- Backend: [route.ts:122-129](src/app/api/files/route.ts#L122-L129)

**Possível solução:**
- Centralizar em `src/lib/utils/parsers.ts`
- Decidir qual abordagem usar (regex genérica vs prefixo explícito)
- Remover parsing do frontend se dados já vêm limpos do backend

---

### 🟡 MÉDIA #5: Processamento ineficiente - dados trafegam mas não são usados
**Status:** ✅ Resolvido (2025-01-04) - API agora retorna dados agregados e processados
**Prioridade:** Média
**Impacto:** Performance e complexidade desnecessária

**Descrição:**
- API faz `include: { linhas: { select: { dadosOriginais: true }}}` trazendo TODOS os dados
- Frontend recebe mas descarta tudo
- Depois tenta processar localmente dados que não existem mais

**Localização:**
- [route.ts:192-201](src/app/api/files/route.ts#L192-L201)
- [MigrateUploads.tsx:58-68](src/components/MigrateUploads.tsx#L58-L68)

**Possível solução:**
- Se frontend não precisa dos dados brutos, API não deveria retornar
- Ou frontend deveria usar os dados que recebe
- Definir responsabilidade clara: quem processa a estrutura hierárquica?

---

## TEMPLATE PARA NOVOS ISSUES

### 🔴/🟡/🟢 [SEVERIDADE] #[NÚMERO]: [Título curto]
**Status:** Pendente | Em progresso | Resolvido
**Prioridade:** Alta | Média | Baixa
**Impacto:** [Descrição do impacto no usuário/sistema]

**Descrição:**
[Explicação técnica do problema]

**Localização:**
- [arquivo:linha](caminho)

**Possível solução:**
[Sugestões de como resolver]

---

## LEGENDAS

**Severidade:**
- 🔴 CRÍTICO - Sistema quebrado/não funciona
- 🟡 MÉDIA - Funciona mas tem problemas
- 🟢 BAIXA - Melhoria/otimização

**Status:**
- ⬜ Pendente
- 🟦 Em progresso
- ✅ Resolvido

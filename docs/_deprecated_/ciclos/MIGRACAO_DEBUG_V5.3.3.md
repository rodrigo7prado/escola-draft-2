# DEBUG do Bug V5.3.3 + V8.1.2: Arrays Vazios na Visualização Hierárquica

**Data:** 2025-11-06
**Status:** 🔍 Em investigação
**Sessão:** 10

---

## 📋 DESCRIÇÃO DO BUG

**Problema reportado:**
- GET `/api/files` retorna arrays vazios para `alunosPendentes` após upload
- Usuário não vê dados (parece que o upload falhou)
- UI mostra contadores zerados ou incorretos

**Comportamento esperado:**
- Após upload bem-sucedido, GET deve retornar estrutura hierárquica completa
- Contadores devem refletir dados reais (CSV vs Banco)
- Arrays de `alunosPendentes` devem listar alunos que estão no CSV mas não no banco

---

## 🔧 MODIFICAÇÕES REALIZADAS

### 1. Logs de Debug Adicionados

**Arquivo:** `src/app/api/files/route.ts`

**Logs implementados:**

1. **Linha 247:** Contagem de linhas importadas
   ```typescript
   console.log(`[GET /api/files] DEBUG: ${linhasImportadas.length} linhas importadas encontradas`);
   ```

2. **Linha 264-272:** Primeira linha processada (parsing de dados)
   ```typescript
   if (linhasImportadas.indexOf(linha) === 0) {
     console.log(`[GET /api/files] DEBUG: Primeira linha processada:`, {
       dadosOriginais: dados,
       anoLetivo,
       turma,
       matricula,
       nome
     });
   }
   ```

3. **Linha 299-305:** Estrutura de períodos e turmas criados
   ```typescript
   console.log(`[GET /api/files] DEBUG: Períodos criados: ${periodosMap.size}`);
   periodosMap.forEach((periodo, ano) => {
     console.log(`[GET /api/files] DEBUG:   - ${ano}: ${periodo.turmas.size} turmas`);
     periodo.turmas.forEach((turmaData, turmaNome) => {
       console.log(`[GET /api/files] DEBUG:     - Turma ${turmaNome}: ${turmaData.alunosCSV.size} alunos no CSV`);
     });
   });
   ```

4. **Linha 322:** Enturmações encontradas no banco
   ```typescript
   console.log(`[GET /api/files] DEBUG: ${enturmacoes.length} enturmações encontradas no banco`);
   ```

5. **Linha 361-370:** Comparação detalhada (filtro: ano 2024, turma 3001)
   ```typescript
   if (periodo.anoLetivo === '2024' && turmaData.nome === '3001') {
     console.log(`[GET /api/files] DEBUG: Comparação para ${periodo.anoLetivo}/${turmaData.nome}:`, {
       totalAlunosCSV,
       totalAlunosBanco,
       pendentes,
       alunosCSVMatriculas: alunosCSV.map(a => a.matricula).slice(0, 3),
       alunosBancoMatriculas: Array.from(alunosNoBancoSet).slice(0, 3),
       alunosPendentesMatriculas: alunosPendentes.map(a => a.matricula)
     });
   }
   ```

---

## 🧪 INSTRUÇÕES PARA TESTE MANUAL

### Pré-requisitos

1. Banco de dados limpo ou com dados conhecidos
2. Arquivo CSV de teste preparado (ex: 3 alunos, turma 3001, ano 2024)
3. Servidor Next.js rodando em desenvolvimento

### Passo a Passo

#### 1. Iniciar o servidor

```bash
cd c:\Users\rprado\Projetos\Next\_escolas\senor_abravanel_draft-2
pnpm dev
```

#### 2. Fazer upload de CSV via interface

- Acessar: `http://localhost:3000`
- Ir para seção "Painel de Migração"
- Fazer upload de arquivo CSV de teste
- **Observar:** Mensagem de sucesso deve aparecer

#### 3. Chamar GET /api/files manualmente

```bash
# Via curl (Windows PowerShell)
curl http://localhost:3000/api/files | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Via curl (Git Bash)
curl http://localhost:3000/api/files | jq '.'

# Via navegador
# Abrir: http://localhost:3000/api/files
```

#### 4. Analisar logs no terminal do servidor

**Logs esperados:**

```
[GET /api/files] DEBUG: 3 linhas importadas encontradas
[GET /api/files] DEBUG: Primeira linha processada: {
  dadosOriginais: { ALUNO: '111111111111111', NOME_COMPL: 'Aluno 1', ... },
  anoLetivo: '2024',
  turma: '3001',
  matricula: '111111111111111',
  nome: 'Aluno 1'
}
[GET /api/files] DEBUG: Períodos criados: 1
[GET /api/files] DEBUG:   - 2024: 1 turmas
[GET /api/files] DEBUG:     - Turma 3001: 3 alunos no CSV
[GET /api/files] DEBUG: 3 enturmações encontradas no banco
[GET /api/files] DEBUG: Comparação para 2024/3001: {
  totalAlunosCSV: 3,
  totalAlunosBanco: 3,
  pendentes: 0,
  alunosCSVMatriculas: ['111111111111111', '222222222222222', '333333333333333'],
  alunosBancoMatriculas: ['111111111111111', '222222222222222', '333333333333333'],
  alunosPendentesMatriculas: []
}
```

#### 5. Analisar resposta JSON

**Estrutura esperada:**

```json
{
  "periodos": [
    {
      "anoLetivo": "2024",
      "resumo": {
        "totalTurmas": 1,
        "totalAlunosCSV": 3,
        "totalAlunosBanco": 3,
        "pendentes": 0,
        "status": "ok"
      },
      "turmas": [
        {
          "nome": "3001",
          "totalAlunosCSV": 3,
          "totalAlunosBanco": 3,
          "pendentes": 0,
          "status": "ok",
          "alunosPendentes": undefined
        }
      ]
    }
  ]
}
```

---

## 🔍 ANÁLISE DE POSSÍVEIS CAUSAS

### Hipótese 1: Timing (GET chamado antes de POST terminar)

**Sintoma:** Arrays vazios imediatamente após upload
**Causa:** Frontend não espera POST completar antes de chamar GET
**Como validar:**
- Adicionar delay de 1s após POST
- Verificar se arrays ainda estão vazios

### Hipótese 2: Dados vazios/null no JSONB

**Sintoma:** Parsing falha, `anoLetivo` ou `turma` ficam `(sem ano)` ou `(sem turma)`
**Causa:** Campos ausentes ou com formato inesperado no CSV
**Como validar:**
- Verificar log de "Primeira linha processada"
- Se `anoLetivo` ou `turma` estiverem com valores default, problema está no parsing

### Hipótese 3: Lógica de comparação incorreta

**Sintoma:** Matrículas não batem (formatos diferentes)
**Causa:** Matrícula no CSV com espaços/trim diferente do banco
**Como validar:**
- Verificar log de "Comparação para 2024/3001"
- Comparar arrays `alunosCSVMatriculas` vs `alunosBancoMatriculas`
- Se matrículas forem diferentes, problema é normalização

### Hipótese 4: Query de enturmações incorreta

**Sintoma:** `enturmacoes.length === 0` mas dados existem no banco
**Causa:** Filtro ou JOIN incorreto na query Prisma
**Como validar:**
- Verificar log de "X enturmações encontradas no banco"
- Se for 0 mas banco tem dados, problema é na query

---

## 📊 CHECKLIST DE VALIDAÇÃO

- [ ] Servidor rodando sem erros
- [ ] Upload de CSV bem-sucedido (201)
- [ ] POST cria registros no banco (verificar logs)
- [ ] GET retorna dados não vazios
- [ ] Logs mostram parsing correto (ano, turma não são defaults)
- [ ] Logs mostram enturmações encontradas (> 0)
- [ ] Contadores batem: CSV === Banco (se upload completo)
- [ ] Arrays de pendentes estão corretos (vazio se tudo OK)

---

## 🐛 BUG IDENTIFICADO

**Data:** 2025-11-06
**Status:** ✅ IDENTIFICADO E CORRIGIDO

### Causa Raiz

**Problema:** Race condition no POST `/api/files` ao criar alunos.

**Detalhes:**
- CSVs do Conexão Educação contêm **múltiplas linhas por aluno** (uma para cada disciplina)
- Exemplo: Aluno `202201911610005` aparece em ~20+ linhas (cada disciplina)
- Código tentava criar o mesmo aluno múltiplas vezes → **Erro P2002** (unique constraint failed)
- Lógica de deduplicação (`alunosUnicos`) existia, mas **não tratava race conditions**

### Evidência

```
Erro ao fazer upload: Error [PrismaClientKnownRequestError]:
Invalid prisma.aluno.create() invocation
Unique constraint failed on the fields: (`matricula`)
at prisma.aluno.create() (src\app\api\files\route.ts:112:46)
code: 'P2002'
```

**Análise dos logs:**
- 4882 linhas importadas
- ~400 alunos únicos esperados
- Apenas 333 enturmações criadas (17% de perda!)
- **Conclusão:** Muitos alunos não foram criados devido ao erro P2002

### Solução Proposta

Adicionar tratamento de erro **P2002** (unique constraint) com retry:

1. **Em `prisma.aluno.create()`:**
   - Capturar erro P2002
   - Buscar aluno novamente (pode ter sido criado por outra linha)
   - Se encontrado, usar o ID existente
   - Se não encontrado, propagar erro

2. **Em `prisma.enturmacao.create()`:**
   - Capturar erro P2002
   - Ignorar (enturmação já existe, não precisa fazer nada)

---

## ✅ CORREÇÃO APLICADA

**Data:** 2025-11-06
**Tempo:** ~30min

### Código Modificado

**Arquivo:** `src/app/api/files/route.ts`

**1. Tratamento em criação de Aluno (linhas 104-162):**

```typescript
for (const [matricula, info] of alunosUnicos) {
  let alunoId: string;

  try {
    const alunoExistente = await prisma.aluno.findUnique({
      where: { matricula }
    });

    if (!alunoExistente) {
      const novoAluno = await prisma.aluno.create({
        data: { matricula, nome, origemTipo: 'csv', ... }
      });
      alunosNovos++;
      alunoId = novoAluno.id;
    } else {
      // Atualizar se fonteAusente
      alunoId = alunoExistente.id;
      alunosAtualizados++;
    }

    alunosIds.set(matricula, alunoId);
  } catch (error: any) {
    // ✅ CORREÇÃO: Tratar race condition P2002
    if (error.code === 'P2002') {
      console.warn(`Race condition detectada para matrícula ${matricula}, tentando buscar novamente...`);
      const alunoExistente = await prisma.aluno.findUnique({
        where: { matricula }
      });

      if (alunoExistente) {
        alunoId = alunoExistente.id;
        alunosIds.set(matricula, alunoId);
        alunosAtualizados++;
      } else {
        throw error; // Aluno não encontrado mesmo após retry
      }
    } else {
      throw error; // Erro não relacionado a race condition
    }
  }
}
```

**2. Tratamento em criação de Enturmação (linhas 176-226):**

```typescript
try {
  const enturmacaoExistente = await prisma.enturmacao.findFirst({
    where: { alunoId, anoLetivo, modalidade, turma, serie }
  });

  if (!enturmacaoExistente) {
    await prisma.enturmacao.create({ ... });
    enturmacoesNovas++;
  } else if (enturmacaoExistente.fonteAusente) {
    // Resetar fonteAusente
    await prisma.enturmacao.update({ ... });
  }
} catch (error: any) {
  // ✅ CORREÇÃO: Tratar race condition P2002
  if (error.code === 'P2002') {
    console.warn(`Race condition detectada em enturmação para aluno ${info.matricula}, ignorando...`);
    // Enturmação já existe, não precisa fazer nada
  } else {
    throw error; // Erro não relacionado a race condition
  }
}
```

### Validação

**Aguardando teste com servidor rodando...**

- [ ] Fazer upload de CSV grande (400+ alunos)
- [ ] Verificar que não há mais erros P2002 nos logs
- [ ] Validar que TODOS os alunos são criados (4882 linhas → ~400 alunos)
- [ ] Validar que GET retorna dados corretos (sem arrays vazios)
- [ ] Validar contadores: CSV === Banco

### Testes Esperados

- ✅ POST sem erros P2002
- ✅ Todos os alunos criados (100% de sucesso)
- ✅ Todas as enturmações criadas
- ✅ GET retorna estrutura hierárquica completa
- ✅ Contadores corretos (sem pendentes se upload completo)


---

## 📝 PRÓXIMOS PASSOS

1. [ ] Executar teste manual seguindo instruções acima
2. [ ] Analisar logs e identificar causa raiz
3. [ ] Aplicar correção
4. [ ] Validar com testes automatizados
5. [ ] Remover logs de debug (ou manter atrás de flag ENV)
6. [ ] Atualizar MIGRACAO_ESPECIFICACAO.md (V5.3.3: ❌ → ✅)
7. [ ] Atualizar MIGRACAO_CICLO.md (nova entrada)
8. [ ] Atualizar CHECKPOINT_METODOLOGIA_CIF.md

---

## 🔗 REFERÊNCIAS

- **Especificação:** `docs/ciclos/MIGRACAO_ESPECIFICACAO.md` (V5.3.3, V8.1.2)
- **Código:** `src/app/api/files/route.ts` (linhas 212-417)
- **Teste existente:** `tests/integration/api/files-get.test.ts`
- **Checkpoint:** `docs/CHECKPOINT_METODOLOGIA_CIF.md` (Sessão 10)
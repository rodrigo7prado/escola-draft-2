# CHECKPOINT - Colagem de Dados Escolares

Conteúdo replicado de `docs/_deprecated_/ciclos/IMPORTACAO_ESTRUTURADA_CHECKPOINT.md` para acompanharmos apenas as etapas ligadas à colagem de dados escolares.

## 🆕 FASE 8: PERÍODOS CURSADOS (NOVA FUNCIONALIDADE)
**Status:** 🔜 Planejado  
**Data de início:** 2025-01-15 (estimado)  
**Objetivo:** Capturar e estruturar histórico de períodos letivos cursados por cada aluno.

---

### 📋 PLANEJAMENTO DE SESSÕES

#### **SESSÃO 1: Database Schema e Migration**
**Foco:** Criar modelo `PeriodoCursado` no Prisma

**Tarefas:**
1. Criar model `PeriodoCursado` com todos os campos identificados
2. Relacionamento 1-N com `Aluno`
3. Adicionar campo `textoBrutoDadosEscolares` no model `Aluno` (se ainda não existe)
4. Rodar migration em ambos os bancos (`pnpm migrate:dev`)

**Campos do model `PeriodoCursado`:**
- Identificação: `id`, `alunoMatricula` (FK)
- Período: `anoLetivo`, `periodoLetivo` (0/1/2)
- Escola: `unidadeEnsino`, `codigoEscola` (opcional)
- Curso: `modalidade`, `segmento`, `curso`, `serie`, `turno`
- Status: `situacao`, `tipoVaga`
- Matriz: `matrizCurricular` (opcional)
- Dados de Ingresso (apenas 1ª linha): `anoIngresso`, `periodoIngresso`, `dataInclusao`, `tipoIngresso`, `redeEnsinoOrigem`
- Campos não capturáveis: `ensinoReligioso`, `linguaEstrangeira` (sempre NULL)
- Rastreabilidade: `textoBrutoOrigemId`, `criadoEm`, `atualizadoEm`

**Critérios de aceite:**
- ✅ Migration executada com sucesso em ambos os bancos
- ✅ Relacionamento Aluno 1-N PeriodoCursado funciona
- ✅ Campo `textoBrutoDadosEscolares` existe em Aluno

**Duração estimada:** 1-2h

---

#### **SESSÃO 2: Parser de Períodos Cursados**
**Foco:** Implementar parsing da tabela "Renovação de Matrícula"

**Tarefas:**
1. Criar `src/lib/parsing/parsePeriodosCursados.ts`
2. Implementar detecção de seções (Dados de Ingresso + Escolaridade + Tabela)
3. Parsing de dados de ingresso (campos especiais da 1ª linha)
4. Parsing de tabela (múltiplas linhas, separadas por TAB)
5. Split de "Modalidade / Segmento / Curso" em 3 campos
6. Reunir dados de ingresso + primeira linha da tabela = primeiro período
7. Testes unitários (casos: 1 período, 3 períodos, sem dados de ingresso)

**Lógica de parsing:**
```
1. Extrair "Dados de Ingresso" (5 campos) → objeto ingressoData
2. Extrair "Escolaridade" (matrizCurricular) → adicionar ao primeiro período
3. Extrair tabela "Renovação de Matrícula" (linhas TAB-separated)
4. Primeira linha da tabela + ingressoData + matrizCurricular = primeiro período completo
5. Demais linhas da tabela = períodos adicionais (sem dados de ingresso)
6. Retornar array de PeriodoCursado[]
```

**Critérios de aceite:**
- ✅ Parser extrai dados de ingresso corretamente
- ✅ Parser extrai todas as linhas da tabela
- ✅ Primeira linha é enriquecida com dados de ingresso + matriz curricular
- ✅ Split de "Modalidade / Segmento / Curso" funciona
- ✅ Campos `ensinoReligioso` e `linguaEstrangeira` sempre NULL
- ✅ Testes cobrem cenários principais

**Duração estimada:** 3-4h

---

#### **SESSÃO 3: API de Processamento**
**Foco:** Atualizar API `/api/importacao-estruturada` para detectar e processar dados escolares

**Tarefas:**
1. Atualizar `detectarTipoPagina.ts` para reconhecer "dadosEscolares"
   - Marcadores: "Renovação de Matrícula", "Ano Letivo", "Período Letivo"
2. Atualizar `POST /api/importacao-estruturada/route.ts`
   - Se tipo = "dadosEscolares": retornar `{ tipo: 'dadosEscolares', periodos: [...] }`
3. Criar endpoint `POST /api/importacao-estruturada/salvar-periodos`
   - Recebe: `{ alunoMatricula, periodos: PeriodoCursado[], textoBruto }`
   - Salva texto bruto em `Aluno.textoBrutoDadosEscolares`
   - Deleta períodos existentes do aluno (estratégia: substituir tudo)
   - Insere novos períodos em lote
   - Retorna: `{ success: true, quantidade: N }`

**Critérios de aceite:**
- ✅ Detecção de "dadosEscolares" funciona
- ✅ API retorna array de períodos parseados
- ✅ Endpoint de salvamento funciona
- ✅ Texto bruto é armazenado em `textoBrutoDadosEscolares`
- ✅ Períodos antigos são substituídos (não duplicados)

**Duração estimada:** 2-3h

---

#### **SESSÃO 4: UI - Sistema de Abas em DadosAlunoEditavel**
**Foco:** Refatorar `DadosAlunoEditavel` para ter 2 abas: Dados Pessoais + Períodos Cursados

**Tarefas:**
1. Reutilizar componente `Tabs` existente (`src/components/ui/Tabs.tsx`)
2. Refatorar `DadosAlunoEditavel` para estrutura:
   ```tsx
   <Tabs>
     <Tab label="Dados Pessoais">{/* conteúdo atual */}</Tab>
     <Tab label="Períodos Cursados">{/* novo componente */}</Tab>
   </Tabs>
   ```
3. Criar componente `PeriodosCursadosLista.tsx` (exibição simples)
   - Recebe: `periodos: PeriodoCursado[]`
   - Exibe tabela ou lista agrupada por ano letivo
   - Colunas: Ano, Período, Escola, Série, Modalidade, Situação

**Critérios de aceite:**
- ✅ Abas funcionam corretamente (navegação)
- ✅ Aba "Dados Pessoais" mantém funcionalidade atual
- ✅ Aba "Períodos Cursados" exibe lista vazia se sem dados
- ✅ Aba "Períodos Cursados" exibe períodos quando existem

**Duração estimada:** 2h

---

#### **SESSÃO 5: Hook e Integração com Modo Colagem**
**Foco:** Atualizar `useModoColagem` para processar dados escolares

**Tarefas:**
1. Atualizar `useModoColagem.ts`:
   - Detectar tipo de resposta da API (`dadosPessoais` vs `dadosEscolares`)
   - Se `dadosEscolares`: abrir modal diferente (`ModalConfirmacaoPeriodos.tsx`)
2. Criar `ModalConfirmacaoPeriodos.tsx`:
   - Exibe tabela de períodos parseados
   - Botão "Confirmar" chama endpoint `/salvar-periodos`
   - Após salvar: refresh de dados do aluno
3. Atualizar hook `useAlunoSelecionado` para buscar períodos cursados

**Critérios de aceite:**
- ✅ Sistema detecta tipo de colagem automaticamente
- ✅ Modal correto é aberto para cada tipo
- ✅ Salvamento de períodos funciona
- ✅ Refresh automático após salvar (painel atualiza)
- ✅ Aba "Períodos Cursados" mostra dados após confirmação

**Duração estimada:** 3-4h

---

#### **SESSÃO 6: Testes e Validação**
**Foco:** Testes automatizados + teste com usuário

**Tarefas:**
1. Testes unitários:
   - `parsePeriodosCursados.test.ts` (parsing completo)
   - `detectarTipoPagina.test.ts` (detecção de dadosEscolares)
2. Testes de integração:
   - API `/importacao-estruturada` com texto de dados escolares
   - API `/importacao-estruturada/salvar-periodos` (criação em lote)
3. Teste manual com colagem real:
   - Colar dados escolares de 3 alunos diferentes
   - Verificar períodos salvos no banco
   - Validar visualização nas abas

**Critérios de aceite:**
- ✅ 100% dos testes unitários passando
- ✅ Testes de integração cobrem fluxo completo
- ✅ Teste manual bem-sucedido (sem erros)
- ✅ Dados visíveis corretamente na aba "Períodos Cursados"

**Duração estimada:** 2-3h

---

#### **SESSÃO 7: Polimento e Documentação**
**Foco:** Ajustes finais e atualização de documentação

**Tarefas:**
1. Adicionar loading states e feedback visual
2. Melhorar mensagens de erro (linguagem clara)
3. Validar comportamento quando aluno não tem períodos
4. Atualizar documentação:
   - `IMPORTACAO_ESTRUTURADA_TECNICO.md` (adicionar seção de Períodos Cursados)
   - `IMPORTACAO_ESTRUTURADA_CICLO.md` (adicionar Fase 8)
   - Este CHECKPOINT (marcar como concluído)
5. Criar entrada no `IMPORTACAO_ESTRUTURADA_CICLO.md` registrando implementação

**Critérios de aceite:**
- ✅ UX polida (loading, erros claros, estados vazios)
- ✅ Documentação atualizada
- ✅ CHECKPOINT marcado como concluído

**Duração estimada:** 1-2h

---

### 📊 RESUMO DE SESSÕES

| Sessão | Foco | Duração | Status |
|--------|------|---------|--------|
| 1 | Database Schema | 1-2h | 🔜 Pendente |
| 2 | Parser de Períodos | 3-4h | 🔜 Pendente |
| 3 | API de Processamento | 2-3h | 🔜 Pendente |
| 4 | UI - Sistema de Abas | 2h | 🔜 Pendente |
| 5 | Hook e Integração | 3-4h | 🔜 Pendente |
| 6 | Testes e Validação | 2-3h | 🔜 Pendente |
| 7 | Polimento e Documentação | 1-2h | 🔜 Pendente |
| **TOTAL** | **Fase 8 Completa** | **14-20h** | **🔜 Planejado** |

---

### 🎯 CONCEITOS-CHAVE A LEMBRAR

1. **Reunião de dados de ingresso + primeira linha da tabela**
   - Primeiro período = dados mais completos
   - Demais períodos = apenas dados da tabela

2. **Estratégia de substituição**
   - Deletar todos os períodos existentes do aluno
   - Inserir novos períodos em lote
   - Evita duplicação e inconsistências

3. **Campos não capturáveis**
   - `ensinoReligioso` e `linguaEstrangeira` sempre NULL
   - Input radio vazio na colagem (não aparece no texto)
   - Documentar claramente na UI (tooltip ou nota)

4. **Nomenclatura consistente**
   - `textoBrutoDadosPessoais` (já existe)
   - `textoBrutoDadosEscolares` (novo)
   - Seguir padrão de naming

5. **Sistema de abas**
   - Reutilizar componente `Tabs` existente
   - Manter consistência visual
   - Não duplicar lógica de abas

---

### 🚧 BLOQUEADORES CONHECIDOS

- Nenhum bloqueador identificado até o momento
- Fase 8 pode iniciar assim que Fase 3 (melhorias de dados pessoais) estiver completa

---

### 📝 NOTAS IMPORTANTES

- **Não confundir** `PeriodoCursado` com `Enturmacao`:
  - `Enturmacao` = dados da escola atual (CSV)
  - `PeriodoCursado` = histórico completo do aluno (colagem)
- **Relacionamento:** Aluno pode ter N enturmações e N períodos cursados
- **Escopo atual:** Apenas captura e visualização (sem edição de períodos por enquanto)

---

**Sessão concluída em:** 2025-11-11  
**Tempo estimado para Fase 3:** 2-3 horas  
**Tempo estimado para Fase 8:** 14-20 horas (7 sessões)  
**Dev server:** `pnpm dev` rodando em background (processo 3fd38b)

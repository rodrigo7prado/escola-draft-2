# CHECKPOINT - Importação Estruturada por Texto

**Data:** 2025-01-31
**Status:** ✅ Fase 1 (Backend) COMPLETA - 21/21 testes passando

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. Database Schema (Prisma)

**Arquivo:** `prisma/schema.prisma`

**Novos campos no modelo `Aluno` (32 campos):**

```prisma
// Dados cadastrais (10)
nome, nomeSocial, sexo, dataNascimento, estadoCivil,
paisNascimento, nacionalidade, naturalidade, uf, necessidadeEspecial

// Documentos (7)
tipoDocumento, rg, complementoIdentidade, estadoEmissao,
rgOrgaoEmissor, rgDataEmissao, cpf

// Filiação (4)
nomeMae, cpfMae, nomePai, cpfPai

// Contato (1)
email

// Certidão Civil (10)
tipoCertidaoCivil, numeroCertidaoCivil, ufCartorio, municipioCartorio,
nomeCartorio, numeroTermo, dataEmissaoCertidao, estadoCertidao,
folhaCertidao, livroCertidao

// Campos de controle da importação estruturada
dadosOriginais                    Json?     @db.JsonB
textoBrutoDadosPessoais           String?   @db.Text
textoBrutoDadosEscolares          String?   @db.Text
dataImportacaoTextoDadosPessoais  DateTime?
dataImportacaoTextoDadosEscolares DateTime?
```

**Migrations executadas:**
- ✅ Migration 1: Campos básicos
- ✅ Migration 2: Campos de filiação (CPF mãe/pai)
- ✅ Migration 3: Todos os 32 campos + campos de certidão civil

---

### 2. Módulos de Parsing

#### `src/lib/parsing/detectarTipoPagina.ts`
**Propósito:** Detecta automaticamente se texto é "dadosPessoais" ou "dadosEscolares"

**Estratégia:**
- Marcadores de dados pessoais: NOME COMPLETO, MATRÍCULA, DATA DE NASCIMENTO
- Marcadores de dados escolares: COMPONENTE CURRICULAR, NOTA, FREQ, RESULTADO
- Lança erro se detectar ambos (ambiguidade)

**Testes:** ✅ 4/4 passando

---

#### `src/lib/parsing/normalizarSexo.ts`
**Propósito:** Normaliza valor de sexo para 'M' | 'F'

**Transformações:**
- "Masculino", "masculino", "MASCULINO", "M", "m" → "M"
- "Feminino", "feminino", "FEMININO", "F", "f" → "F"
- Qualquer outro valor → `undefined`

**Testes:** ✅ 5/5 passando

---

#### `src/lib/parsing/parseDadosPessoais.ts`
**Propósito:** Extrai todos os 32 campos do texto colado

**Características principais:**

1. **Parsing Contextual de CPFs** (CRÍTICO):
   ```typescript
   function extrairCPFs(texto: string): {
     cpfAluno?: string;
     cpfMae?: string;
     cpfPai?: string;
   }
   ```

   **Estratégia de 3 níveis:**
   - CPF após "Nome da Mãe:" → CPF da mãe
   - CPF após "Nome do Pai:" → CPF do pai
   - CPF próximo a "TIPO:", "RG", "ÓRGÃO EMISSOR" → CPF do aluno

   **Justificativa:** O texto fonte não diferencia CPFs com rótulos, apenas mostra "CPF:" para todos. A única forma de distinguir é pelo contexto (linhas adjacentes).

2. **Tratamento de Naturalidade:**
   ```typescript
   // Entrada:  "NATURALIDADE: 00001404 IPU"
   // Saída:    "IPU" (remove código numérico)
   ```

3. **Normalização de CPF:**
   - Remove toda formatação (pontos, hífens)
   - "123.456.789-00" → "12345678900"

4. **Regexes com word boundary para certidões:**
   - Usa `^` (início de linha) + flag `m` (multiline)
   - Evita casamento ambíguo entre "CERTIDÃO CIVIL:" e "TIPO CERTIDÃO CIVIL:"

**Testes:** ✅ 12/12 passando (incluindo teste com exemplo real do DESCOBERTA)

---

### 3. APIs REST

#### `POST /api/importacao-estruturada`
**Propósito:** Recebe texto colado, detecta tipo e retorna dados parseados

**Request:**
```json
{
  "texto": "string",
  "matricula": "string (15 dígitos)",
  "alunoId": "string (uuid)"
}
```

**Response (dadosPessoais):**
```json
{
  "sucesso": true,
  "tipoPagina": "dadosPessoais",
  "precisaConfirmarSexo": boolean,
  "dados": { /* DadosPessoais (32 campos) */ }
}
```

**Response (dadosEscolares):**
```json
{
  "sucesso": true,
  "tipoPagina": "dadosEscolares",
  "mensagem": "Dados escolares recebidos com sucesso"
}
```

**Validações:**
- Valida que aluno existe no banco
- Detecta tipo de página automaticamente
- Lança erro se texto ambíguo

---

#### `POST /api/importacao-estruturada/salvar`
**Propósito:** Salva dados parseados no banco de dados

**Request:**
```json
{
  "alunoId": "string (uuid)",
  "textoBruto": "string",
  "dados": { /* Objeto com campos parseados */ }
}
```

**Estratégia de salvamento:**
1. Salva dados em campos normais do banco (para compatibilidade)
2. Salva dados em `dadosOriginais` (JSONB) - dados estruturados
3. Salva texto bruto em `textoBrutoDadosPessoais` - para auditoria

**⚠️ PENDENTE:** Atualizar para mapear todos os 32 campos (atualmente mapeando apenas 13)

---

### 4. Testes Automatizados

**Framework:** Vitest
**Total de testes:** 21
**Status:** ✅ 21/21 passando (100%)

**Cobertura:**
- `detectarTipoPagina`: 4 testes
- `normalizarSexo`: 5 testes
- `parseDadosPessoais`: 12 testes
  - Parsing de campos básicos
  - Parsing contextual de CPFs (crítico)
  - Parsing de documentos
  - Parsing de filiação
  - Parsing de certidão civil
  - Parsing de contato
  - Remoção de código da naturalidade
  - Normalização automática de sexo
  - Tratamento de campos ausentes
  - Teste com exemplo real completo

**Arquivo:** `tests/lib/parsing/parsing.test.ts`

---

## 🔧 PROBLEMAS RESOLVIDOS

### Problema 1: CPFs sem distinção
**Sintoma:** Texto fonte só mostra "CPF:" para aluno, mãe e pai
**Solução:** Parsing contextual baseado em linhas adjacentes
**Status:** ✅ Resolvido e testado

### Problema 2: Regex ambígua para certidões
**Sintoma:** `/CERTIDÃO CIVIL:/` casava com "TIPO CERTIDÃO CIVIL:"
**Solução:** Usar `^` (início de linha) + flag `m` (multiline)
**Status:** ✅ Resolvido e testado

### Problema 3: Naturalidade com código
**Sintoma:** Valor vinha como "00001404 IPU"
**Solução:** Função específica que remove primeira parte (código numérico)
**Status:** ✅ Resolvido e testado

### Problema 4: Testes não rodavam
**Sintoma:** Segmentation fault ao rodar `pnpm test`
**Solução:** Corrigir imports (usar `@/` alias) e remover import desnecessário de `describe/it/expect` (já vem de `globals: true`)
**Status:** ✅ Resolvido

---

## 📋 PRÓXIMOS PASSOS (Fase 2 - Frontend)

### 1. Atualizar API de salvamento
**Arquivo:** `src/app/api/importacao-estruturada/salvar/route.ts`

**Tarefa:** Mapear todos os 32 campos parseados para o banco de dados

**Campos faltando mapear:**
- Dados cadastrais: nomeSocial, estadoCivil, paisNascimento, uf, necessidadeEspecial
- Documentos: tipoDocumento, complementoIdentidade, estadoEmissao
- Filiação: cpfMae, cpfPai (já parseados, falta mapear)
- Contato: email
- Certidão Civil: todos os 10 campos

---

### 2. Componente: Botão de Colagem
**Arquivo:** `src/components/BotaoColagemAluno.tsx` (criar)

**Funcionalidades:**
- Botão "📋 Copiar matrícula" - Copia número para clipboard
- Botão "🔓 Habilitar colagem" - Botão alternante (toggle)
- Estado visual: ativo (verde) / inativo (cinza)

**Localização na UI:** Item da lista em `ListaAlunosCertificacao.tsx`

---

### 3. Componente: Área de Colagem
**Arquivo:** `src/components/AreaColagemDados.tsx` (criar)

**Funcionalidades:**
- Escuta evento de colagem (`onPaste`)
- Envia texto para API `/api/importacao-estruturada`
- Mostra loading durante processamento
- Abre modal de confirmação com dados parseados

**Estado:** Só ativa quando botão de colagem estiver ativo

---

### 4. Componente: Modal de Confirmação
**Arquivo:** `src/components/ModalConfirmacaoDados.tsx` (criar)

**Funcionalidades:**
- Exibe todos os campos parseados (organizados por seção)
- Campo especial obrigatório: Sexo (se não detectado no parsing)
- Dropdown para selecionar Masculino/Feminino
- Preview visual dos dados que serão salvos
- Botões: "Cancelar" e "Confirmar" (Enter para confirmar)

**Seções a exibir:**
1. Dados Cadastrais (10 campos)
2. Documentos (7 campos)
3. Filiação (4 campos)
4. Contato (1 campo)
5. Certidão Civil (10 campos)

---

### 5. Componente: Visualização de Merge
**Arquivo:** `src/components/MergeVisualDados.tsx` (criar)

**Funcionalidades:**
- Mostra comparação lado a lado: Original vs Editado
- Badge colorido quando valores diferem
- Cores:
  - 🔵 Azul: OK (não alterado)
  - 🟢 Verde: CORRIGIDO (importado diferente do CSV)
  - 🟡 Amarelo: FONTE AUSENTE

**Localização:** Dentro de `DadosAlunoEditavel.tsx` (já existe)

---

### 6. Hook: useModoColagem
**Arquivo:** `src/hooks/useModoColagem.ts` (criar)

**Estado gerenciado:**
- `modoColagemAtivo: boolean`
- `alunoSelecionado: string | null`
- `dadosParsed: DadosPessoais | null`
- `isLoading: boolean`

**Handlers:**
- `ativarModoColagem(alunoId)`
- `desativarModoColagem()`
- `handlePaste(texto)`
- `handleConfirmar(dados, sexoConfirmado?)`

---

## 📚 DOCUMENTAÇÃO CRIADA

1. ✅ `IMPORTACAO_ESTRUTURADA_DESCOBERTA.md` - Análise de requisitos e perguntas
2. ✅ `IMPORTACAO_ESTRUTURADA_ESPECIFICACAO.md` - Checklist executável
3. ✅ `IMPORTACAO_ESTRUTURADA_CHECKPOINT.md` - Este documento

**Pendente:**
- `IMPORTACAO_ESTRUTURADA_TECNICO.md` - Detalhes de implementação
- `IMPORTACAO_ESTRUTURADA_CICLO_DE_VIDA.md` - Roadmap completo

---

## 🎯 CRITÉRIOS DE SUCESSO (Fase 2)

- [ ] Usuário consegue copiar matrícula com 1 clique
- [ ] Usuário consegue ativar modo colagem com 1 clique
- [ ] Usuário cola texto (Ctrl+V) e vê modal de confirmação imediatamente
- [ ] Modal mostra todos os campos parseados organizadamente
- [ ] Se sexo não foi detectado, modal exige seleção manual
- [ ] Ao confirmar (Enter ou botão), dados são salvos no banco
- [ ] Após salvar, modo colagem é desativado automaticamente
- [ ] Dados aparecem em `DadosAlunoEditavel` com badges de merge

---

## 🔗 ARQUIVOS IMPORTANTES

**Backend (Fase 1 - COMPLETO):**
- `prisma/schema.prisma` - Schema com 32 novos campos
- `src/lib/parsing/detectarTipoPagina.ts` - Detector de tipo
- `src/lib/parsing/normalizarSexo.ts` - Normalizador de sexo
- `src/lib/parsing/parseDadosPessoais.ts` - Parser principal (32 campos)
- `src/app/api/importacao-estruturada/route.ts` - API de parsing
- `src/app/api/importacao-estruturada/salvar/route.ts` - API de salvamento (PENDENTE atualização)
- `tests/lib/parsing/parsing.test.ts` - 21 testes (100% passando)

**Frontend (Fase 2 - PENDENTE):**
- `src/components/BotaoColagemAluno.tsx` - A criar
- `src/components/AreaColagemDados.tsx` - A criar
- `src/components/ModalConfirmacaoDados.tsx` - A criar
- `src/components/MergeVisualDados.tsx` - A criar
- `src/hooks/useModoColagem.ts` - A criar

**Documentação:**
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_DESCOBERTA.md`
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_ESPECIFICACAO.md`
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_CHECKPOINT.md` (este arquivo)

---

## 💡 LIÇÕES APRENDIDAS

1. **Parsing contextual é essencial** quando labels são ambíguos
2. **Word boundaries em regex** evitam casamentos indesejados
3. **Testes primeiro** aceleram desenvolvimento e garantem qualidade
4. **Separar UI de lógica** (hooks) facilita manutenção
5. **Metodologia CIF funciona** - descoberta evitou retrabalho

---

**Próxima sessão:** Implementação do Frontend (Fase 2)
**Estimativa:** 2-3 horas de desenvolvimento + testes
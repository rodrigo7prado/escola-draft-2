# CONCEITO: Painel de Migração de Dados CSV

## 1. VISÃO GERAL

**O que é esta funcionalidade?**

O Painel de Migração é a funcionalidade responsável por importar dados de alunos, enturmações e histórico escolar a partir de arquivos CSV exportados do sistema oficial Conexão Educação (SEEDUC-RJ). Ele transforma dados não estruturados em um modelo relacional hierárquico, organizando automaticamente por período letivo, modalidade, série, turma e aluno.

**Resumo em uma frase:** Upload de CSV → Detecção de duplicatas → Parsing inteligente → Armazenamento em 3 camadas → Visualização hierárquica.

---

## 2. PROBLEMA QUE RESOLVE

**Qual dor do usuário estamos resolvendo?**

O sistema oficial Conexão Educação da SEEDUC-RJ armazena dados de alunos em formato CSV com estrutura complexa e pouco amigável para manipulação direta. Escolas precisam emitir certificados e certidões, mas os dados estão dispersos, sem estrutura clara e com formatações inconsistentes.

**Antes:**
- Dados em arquivos CSV desorganizados, com prefixos redundantes ("Ano Letivo: 2024")
- Sem forma de visualizar hierarquia (qual aluno está em qual turma, em qual período)
- Sem controle de duplicatas (risco de importar mesmo arquivo múltiplas vezes)
- Impossível editar dados manualmente sem perder rastreabilidade
- Dados originais se perdiam ao serem editados

**Depois (com esta funcionalidade):**
- Upload simples via drag-and-drop de múltiplos arquivos CSV
- Parsing automático com tratamento de prefixos e inconsistências
- Detecção automática de arquivos duplicados (mesmo com nomes diferentes)
- Visualização hierárquica: Período → Modalidade → Turma → Alunos
- Preservação dos dados originais (rastreabilidade)
- Possibilidade de edição sem perder vínculo com origem
- Possibilidade de deletar e reimportar períodos inteiros

---

## 3. ESCOPO

### O que FAZ parte desta funcionalidade:

- ✅ Upload de arquivos CSV via drag-and-drop ou seleção manual (múltiplos arquivos)
- ✅ Parsing tolerante de CSV (suporta aspas, BOM, linhas vazias)
- ✅ Validação de headers obrigatórios
- ✅ Detecção de duplicatas por hash SHA-256 (mesmo arquivo = mesmo hash)
- ✅ Remoção de prefixos dos valores ("Ano Letivo: 2024" → "2024")
- ✅ Armazenamento em 3 camadas:
  - Camada 1 (Origem): Dados imutáveis em JSONB
  - Camada 2 (Estruturada): Aluno, Enturmação (editáveis)
  - Camada 3 (Auditoria): Registro de alterações
- ✅ Criação automática de alunos e enturmações a partir das linhas do CSV
- ✅ Atualização de vínculos quando aluno já existe
- ✅ Visualização hierárquica por período letivo, modalidade e turma
- ✅ Delete seguro por período, modalidade ou arquivo individual (soft delete)
- ✅ Marcação de "fonte ausente" quando CSV é deletado mas dados permanecem
- ✅ Possibilidade de reimportação após delete

### O que NÃO FAZ parte (out of scope):

- ❌ Edição manual de dados dos alunos (funcionalidade: Central de Alunos)
- ❌ Validação de dados de negócio (notas, frequência, aprovação)
- ❌ Validação de histórico escolar (funcionalidade: Validação de Inconsistências)
- ❌ Emissão de certificados e certidões (funcionalidade: Impressão de Documentos)
- ❌ Importação de outros formatos além de CSV (ex: Excel, XML)
- ❌ Integração direta com API do Conexão Educação (apenas importação de arquivos exportados)
- ❌ Validação de CPF, RG ou outros documentos

---

## 4. FLUXO DO USUÁRIO

**Jornada completa do usuário:**

1. **Usuário acessa a página principal** do sistema
2. **Clica em "Painel de Migração"** no accordion da página inicial
3. **Arrasta arquivo(s) CSV** para área de upload (ou clica para selecionar)
4. **Sistema valida headers obrigatórios**
   - Se faltando headers: exibe erro listando quais estão ausentes
   - Se válido: prossegue para parsing
5. **Sistema faz parsing do CSV** com função tolerante (suporta aspas, BOM, etc)
6. **Sistema calcula hash SHA-256** dos dados (ordenados para garantir consistência)
7. **Sistema verifica duplicatas** no banco de dados
   - Se arquivo já foi importado: exibe erro "Arquivo duplicado"
   - Se novo: prossegue para persistência
8. **Sistema salva dados em 3 camadas:**
   - Camada 1: ArquivoImportado + LinhaImportada (JSONB com dados originais)
   - Camada 2: Cria/atualiza Aluno e Enturmação (dados estruturados)
   - Camada 3: (Auditoria será registrada em edições futuras)
9. **Sistema retorna estatísticas do processamento:**
   - Linhas importadas: X
   - Alunos novos: Y
   - Alunos atualizados: Z
   - Enturmações novas: W
10. **Usuário visualiza dados importados** organizados por:
    - Abas de Período Letivo (ex: 2024, 2023, 2022...)
    - Dentro de cada período: Abas de Modalidade (REGULAR, EJA, etc)
    - Dentro de cada modalidade: Lista de turmas com contagem de alunos
11. **Usuário pode deletar dados** (opcional):
    - Delete individual: botão X em cada arquivo
    - Delete por período: botão "Excluir [ano]"
    - Delete por modalidade: botão "Excluir [modalidade]"
    - Confirmação em 2 passos para evitar acidentes

**Fluxos alternativos:**

- **Erro - Headers inválidos:**
  - Sistema exibe mensagem: "Faltando headers obrigatórios: X, Y, Z"
  - Upload não é processado
  - Usuário pode tentar com outro arquivo

- **Erro - Arquivo duplicado:**
  - Sistema exibe mensagem: "Arquivo já foi importado anteriormente"
  - Upload não é processado (evita duplicação de dados)
  - Usuário pode deletar período e reimportar se necessário

- **Sucesso - Reimportação:**
  - Usuário deleta período letivo inteiro
  - Dados estruturados (Aluno, Enturmação) ficam órfãos (fonteAusente=true)
  - Dados originais (ArquivoImportado, LinhaImportada) são hard deleted
  - Hash é removido do banco
  - Usuário pode importar novamente o mesmo arquivo
  - Sistema recria vínculos ou cria novos registros conforme necessário

---

## 5. CONCEITOS-CHAVE

**Termos específicos desta funcionalidade que precisam ser entendidos:**

### Camada de Origem (Imutável)

**Definição:** Camada do banco de dados que armazena dados exatamente como vieram do CSV, sem qualquer transformação ou edição.

**Por que existe:**
- Rastreabilidade: sempre podemos consultar o que veio do arquivo original
- Comparação: permite identificar o que foi editado manualmente vs o que veio do CSV
- Auditoria: em caso de problemas, podemos reconstruir histórico completo

**Modelos:**
- `ArquivoImportado`: metadados do arquivo (nome, hash, data, status)
- `LinhaImportada`: cada linha do CSV em formato JSONB (campo `dadosOriginais`)

**Regra:** Dados da origem NUNCA são alterados. Apenas soft delete (status='excluido').

---

### Camada Estruturada (Editável)

**Definição:** Camada do banco de dados com dados normalizados, estruturados em models relacionais (Aluno, Enturmação), que PODEM ser editados pelo usuário.

**Por que existe:**
- Performance: queries relacionais são mais rápidas que buscar em JSONB
- Integridade: validações e constraints do Prisma
- Editabilidade: usuário pode corrigir dados manualmente

**Modelos:**
- `Aluno`: dados pessoais, documentos, naturalidade, filiação
- `Enturmacao`: relaciona aluno com turma em um período letivo específico

**Vínculo com origem:** Campo `linhaOrigemId` (FK para LinhaImportada, onDelete: SetNull)

---

### Fonte Ausente

**Definição:** Estado de um registro estruturado (Aluno/Enturmação) quando o CSV de origem foi deletado mas o registro permanece no banco.

**Por que existe:**
- Preservar dados editados manualmente após delete do CSV
- Indicar visualmente ao usuário que aquele dado não tem mais rastreabilidade
- Permitir reimportação sem perder trabalho manual

**Campo:** `fonteAusente: boolean` (true quando linhaOrigemId é NULL e origemTipo='csv')

**Comportamento:**
1. Usuário deleta período 2024
2. ArquivoImportado e LinhaImportada são HARD DELETED
3. Aluno.linhaOrigemId → NULL (onDelete: SetNull)
4. Sistema marca Aluno.fonteAusente = true
5. UI exibe aviso amarelo: "⚠️ Fonte de dados ausente"

---

### Prefixos nos Valores

**Definição:** Formatação padrão do sistema Conexão Educação onde valores vêm com texto descritivo redundante.

**Por que existe:** Formatação nativa do sistema oficial (não podemos mudar a origem).

**Exemplos:**
```
Ano: "Ano Letivo: 2024"
MODALIDADE: "Modalidade: REGULAR"
TURMA: "Turma: 3001"
SERIE: "Série: 3"
TURNO: "Turno: MANHÃ"
```

**Tratamento:** Função `limparValor()` remove prefixos automaticamente antes de salvar no banco.

```typescript
limparValor("Ano Letivo: 2024", "Ano Letivo:") → "2024"
limparValor("Modalidade: REGULAR", "Modalidade:") → "REGULAR"
```

**Importância:** Sem essa limpeza, dados vão pro banco com prefixos e causam erros de "value too long for column" ou queries que não funcionam.

---

### Hash de Duplicatas

**Definição:** Identificador único gerado a partir do conteúdo completo do CSV, usado para detectar arquivos duplicados mesmo com nomes diferentes.

**Por que existe:**
- Evitar processamento redundante
- Prevenir duplicação de dados no banco
- Permitir reimportação controlada (após delete)

**Como funciona:**
1. Sistema ordena headers alfabeticamente
2. Sistema ordena rows por concatenação de valores
3. Gera SHA-256 do JSON resultante
4. Hash é armazenado em `ArquivoImportado.hashArquivo`

**Exemplo:**
- Arquivo: `turma-3001.csv` → Hash: `abc123...`
- Usuário tenta importar `turma-3001-copia.csv` (mesmo conteúdo)
- Sistema detecta: mesmo hash → retorna 409 Conflict

**Reset:** Ao deletar período, hash é removido → reimportação é permitida.

---

### Soft Delete

**Definição:** Técnica de "deleção" onde registro não é removido fisicamente do banco, apenas marcado como inativo.

**Por que existe:**
- Possibilidade de recuperação (undo)
- Auditoria: saber quem deletou o quê e quando
- Integridade referencial: evitar cascade de hard deletes

**Implementação:**
- Campo `status`: 'ativo' | 'excluido'
- Campo `excluidoEm`: timestamp da deleção

**Comportamento:**
- GET /api/files: retorna apenas status='ativo'
- DELETE /api/files: muda status para 'excluido'

**Exceção:** ArquivoImportado e LinhaImportada são HARD DELETED ao resetar período (para permitir reimportação).

---

### Enturmações Múltiplas

**Definição:** Um aluno pode ter MÚLTIPLAS enturmações ao longo dos anos letivos.

**Por que existe:** Aluno estuda em 2022 (1ª série), 2023 (2ª série), 2024 (3ª série) - são 3 enturmações distintas.

**Modelo:** Relacionamento 1-N entre Aluno e Enturmacao

**Implicação:** Sempre filtrar enturmações por `anoLetivo` ao buscar dados de um aluno.

---

## 6. REGRAS DE NEGÓCIO PRINCIPAIS

**Regras que NÃO PODEM ser violadas:**

1. **Não permitir arquivo duplicado (mesmo hash)**
   - **Justificativa:** Evitar processamento redundante e duplicação de dados
   - **Validação:** V2.2.1, V2.2.2
   - **Comportamento:** Retornar 409 Conflict se hash já existe

2. **Aluno não pode ter múltiplas enturmações idênticas**
   - **Justificativa:** Uma turma por aluno por período letivo
   - **Validação:** V4.3.1, V4.3.2
   - **Comportamento:** Verificar unicidade (anoLetivo + regime + modalidade + turma + serie)

3. **Delete de CSV não pode apagar alunos editados manualmente**
   - **Justificativa:** Preservar trabalho manual do usuário
   - **Validação:** V6.2.1, V6.2.2
   - **Comportamento:** Hard delete origem (CSV) + SetNull estrutura (Aluno/Enturmação)

4. **Prefixos devem ser removidos antes de salvar no banco**
   - **Justificativa:** Evitar erros de "value too long" e garantir queries funcionem
   - **Validação:** V3.1.1 a V3.1.5
   - **Comportamento:** Aplicar `limparValor()` em todos os campos relevantes

5. **Headers obrigatórios devem estar presentes**
   - **Justificativa:** Garantir que dados essenciais existam para processamento
   - **Validação:** V1.1.2
   - **Comportamento:** Rejeitar CSV se faltar algum header obrigatório

---

## 7. STAKEHOLDERS

**Quem se beneficia ou é afetado por esta funcionalidade?**

| Stakeholder | Interesse | Impacto |
|-------------|-----------|---------|
| Secretaria da Escola | Importar dados oficiais rapidamente para emissão de documentos | Alto - Usa no início de cada semestre/ano |
| Coordenador Pedagógico | Visualizar dados estruturados por turma para planejamento | Médio - Consulta eventual |
| Diretor | Ter base de dados confiável para tomada de decisão | Médio - Usa para relatórios |
| Desenvolvedor | Manter e evoluir sistema sem quebrar integridade | Alto - Precisa entender arquitetura |
| Alunos/Pais | Receber documentos corretos e rápidos | Indireto - Beneficiados pelo resultado final |
| SEEDUC-RJ | Sistema oficial funcionar como fonte única da verdade | Baixo - Não interage diretamente |

---

## 8. MÉTRICAS DE SUCESSO

**Como saberemos que esta funcionalidade está cumprindo seu papel?**

- **Tempo médio de importação:** < 30 segundos para arquivo com 1000 linhas
- **Taxa de sucesso de upload:** > 95% (considerando CSVs válidos)
- **Taxa de erro por duplicatas:** < 5% (usuário tentando importar novamente)
- **Zero perda de dados:** Após delete/reimportação, nenhum aluno é perdido acidentalmente
- **Usabilidade:** Usuário consegue importar sem ajuda/treinamento (primeiro uso intuitivo)
- **Rastreabilidade:** 100% dos alunos podem ser rastreados até o CSV original (ou marcados como fonte ausente)

---

## 9. LIMITAÇÕES CONHECIDAS

**O que esta funcionalidade NÃO faz (e por quê)?**

1. **Não valida dados de negócio (notas, frequência, aprovação)**
   - **Motivo:** Isso é responsabilidade de outra funcionalidade (Validação de Inconsistências - Nível 4)
   - **Escopo:** Painel de Migração apenas importa e organiza dados brutos

2. **Não importa dados de outras fontes além de CSV**
   - **Motivo:** Escopo inicial focado em Conexão Educação (formato CSV)
   - **Futuro:** Pode ser estendido para Excel, XML, JSON se necessário

3. **Não valida documentos (CPF, RG)**
   - **Motivo:** Validação de documentos será feita em outra funcionalidade (Validação de Consistência de Dados - Nível 3)
   - **Escopo:** Painel de Migração apenas armazena dados como vieram do CSV

4. **Não mostra preview completo antes de salvar**
   - **Motivo:** Decisão de UX - preview apenas dos headers, processamento direto
   - **Trade-off:** Velocidade vs controle (priorizamos velocidade)

5. **Não desfaz importação (undo)**
   - **Motivo:** Complexidade técnica (múltiplos alunos/enturmações criados)
   - **Alternativa:** Usuário pode deletar período e reimportar

---

## 10. EVOLUÇÃO FUTURA (ROADMAP)

**Possíveis melhorias para versões futuras:**

- [ ] **Suporte a Excel (.xlsx)** - Facilitar importação sem converter para CSV
- [ ] **Importação incremental** - Apenas novos alunos (não reprocessar tudo)
- [ ] **Preview completo antes de salvar** - Usuário revisa dados antes de confirmar
- [ ] **Log de auditoria completo** - Quem importou, quando, quais dados foram alterados
- [ ] **Validação de dados durante importação** - Detectar problemas cedo (ex: CPF inválido)
- [ ] **Importação assíncrona com progresso** - Para arquivos muito grandes (>5MB)
- [ ] **Deduplicação inteligente de alunos** - Detectar nomes similares (ex: "João Silva" vs "JOAO SILVA")
- [ ] **Rollback de importação** - Desfazer importação específica sem afetar outras
- [ ] **Integração direta com API do Conexão** - Buscar dados em tempo real (sem necessidade de CSV)

---

## REFERÊNCIAS

- **Documentação relacionada:**
  - [Especificação de Integridade](./MIGRACAO_ESPECIFICACAO.md)
  - [Documentação Técnica](./MIGRACAO_TECNICO.md)
  - [Ciclo de Vida](./MIGRACAO_CICLO.md)

- **Documentos do projeto:**
  - [CLAUDE.md](../../CLAUDE.md) - Instruções gerais do projeto
  - [Metodologia CIF](../METODOLOGIA_CIF.md) - Visão geral da metodologia

- **Arquivos de código:**
  - [src/components/MigrateUploads.tsx](../../src/components/MigrateUploads.tsx)
  - [src/components/DropCsv.tsx](../../src/components/DropCsv.tsx)
  - [src/app/api/files/route.ts](../../src/app/api/files/route.ts)
  - [prisma/schema.prisma](../../prisma/schema.prisma)

---

**Data de criação:** 2025-11-04
**Última atualização:** 2025-11-04
**Autor:** Claude (com base em análise do código existente)
**Revisado por:** A revisar

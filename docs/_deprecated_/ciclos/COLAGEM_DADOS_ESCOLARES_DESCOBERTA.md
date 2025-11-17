# DESCOBERTA: Colagem de Dados Escolares

## PROPÓSITO DESTE DOCUMENTO

Este documento compila perguntas críticas que precisam ser respondidas antes de abrirmos a especificação técnica. O objetivo é garantir que a solução para Colagem de Dados Escolares seja fundamentada em dados reais da fonte, necessidades do usuário final e restrições do produto.

**Fluxo CIF:** CONCEITO → DESCOBERTA → ESPECIFICAÇÃO → TÉCNICO → CICLO DE VIDA

---

## ✅ CHECKLIST DE DESCOBERTA
- ✅ Estrutura do texto fonte mapeada
- ✅ Campos obrigatórios e opcionais identificados
- ✅ Necessidades de UX alinhadas com produto
- ⚠️ Estratégia final de persistência (schema Prisma) – detalhar no documento técnico
- ⚠️ Log/auditoria e histórico de reimportações – definir no CICLO

---

## 1. ANÁLISE DE DADOS DE ORIGEM

### 1.1 Estrutura do Texto Fonte ✅

> 📄 **Modelo completo de colagem:** [modelos/DadosEscolaresColagemModelo.md](./modelos/DadosEscolaresColagemModelo.md)

- Texto copiado diretamente da aba **"Dados Escolares"** do sistema SEEDUC-RJ.
- Possui blocos sequenciais separados por títulos (`Aluno`, `Dados de Ingresso`, `Escolaridade`, `Renovação de Matrícula`, `Histórico de Confirmação de Matrícula`).
- Inclui menus e breadcrumbs no topo (devem ser descartados durante o parsing).
- Campos seguem padrão `Label:* <tab> Valor`, com labels contendo acentos e, em alguns casos, códigos antes da descrição.

**Trecho real fornecido (resumido):**
```
Aluno
Inscrição Matrícula Fácil:	3102679
Matrícula:*	202215211346542
Situação:	Concluido
...
Dados de Ingresso
Ano Ingresso:*	<2022>
Período Ingresso:*	0
...
Renovação de Matrícula
Ano Letivo	Período Letivo	Unidade de Ensino ...
2024	0	CE SENOR ABRAVANEL	...
2023	0	CE ANTONIO PRADO JUNIOR	...
Histórico de Confirmação de Matrícula
Código	Ano Letivo	Período Letivo	Unidade de Ensino ...
15472132	2024	0	33063397 - CE SENOR ABRAVANEL	...
```

### 1.2 Seções e Marcadores Obrigatórios ✅

| Seção                      | Marcadores-chave                                                | Observações |
|---------------------------|-----------------------------------------------------------------|-------------|
| Aluno                     | `Inscrição Matrícula Fácil`, `Matrícula`, `Situação`, `Motivo`   | Sempre aparece no topo. |
| Dados de Ingresso         | `Ano Ingresso`, `Período Ingresso`, `Data de Inclusão`, `Tipo`   | Ano vem entre `<>`, período é número. |
| Escolaridade              | `Unidade de Ensino`, `Nível/Segmento`, `Modalidade`, `Curso`, `Turno`, `Matriz Curricular`, `Série/Ano Escolar`, `Recebe Escolarização em Outro Espaço?` | Unidade possui código + nome na mesma linha. |
| Renovação de Matrícula    | Cabeçalho com 10 colunas fixas                                  | Necessário tratar múltiplas linhas. |
| Histórico de Confirmação  | Cabeçalho com 11 colunas (inclui `Código` e `Data Situação`)    | Pode estar vazio; mesmo assim cabeçalho existe. |

### 1.3 Tabelas e Normalizações ✅

> 📄 **Modelo completo de colagem:** [modelos/DadosEscolaresColagemModelo.md](./modelos/DadosEscolaresColagemModelo.md)

- Tabelas são tabulares com colunas separadas por `	`.
- `Unidade de Ensino` (tabela) precisa ser dividida em código (quando presente) e descrição.
- `Modalidade / Segmento / Curso` contém valores concatenados com ` / `; manter string completa e também derivar atributos quando necessário.
- `Ensino Religioso` e `Língua Estrangeira` podem vir vazios (`""`), devendo ser armazenados como `null`.
- Histórico de confirmação possui linhas com `Situação *` + `Data Situação` (dois campos). Precisamos preservar ambos.
- `Ano Ingresso` deve ser inserido no array de histórico se não existir para evitar buracos cronológicos.

### 1.4 Ambiguidades / Perguntas Abertas ⚠️

- O quadro “Histórico de Confirmação” pode ser opcional em algumas escolas? Se ausente, devemos registrar array vazio.
- Alguns cursos exibem códigos diferentes entre seção de Escolaridade e as tabelas. Confirmar se devemos guardar ambos separadamente (código + descrição).
- Verificar se existe mais de uma tabela “Renovação de Matrícula” (paginada). O texto indica `Página 1 de 1`; precisamos tratar paginação caso apareça `Próximo`.

---

## 2. USUÁRIOS E FLUXO

### 2.1 Personas ✅

| Persona                 | Objetivo                                                           |
|------------------------|--------------------------------------------------------------------|
| Secretaria escolar     | Registrar dados oficiais de cada aluno rapidamente                 |
| Coordenação pedagógica | Validar histórico antes de emitir certificações                    |
| Time de certificação   | Garantir que todos os dados necessários estejam em nosso banco     |

### 2.2 Jornada Atual e Dor ✅

1. Usuário acessa aluno no sistema SEEDUC.
2. Precisa copiar manualmente cada bloco para planilhas ou reescrever em outros sistemas.
3. Nenhum status interno indica se os dados escolares foram capturados.
4. Possíveis erros de digitação e esquecimentos de campos.

### 2.3 Experiência Desejada ✅

- Único ponto de entrada (colagem) alinhado com fluxo já conhecido dos dados pessoais.
- Modal apresenta os dados organizados de forma amigável e somente leitura.
- Lista de alunos exibe check simples: verde = importado; laranja = pendente.
- Possibilidade de reimportar quando novas renovações aparecerem.

---

## 3. RESTRIÇÕES E DEPENDÊNCIAS

### 3.1 Técnicas ✅

- Ambiente Next.js + Prisma já possui campos `textoBrutoDadosEscolares` e `dataImportacaoTextoDadosEscolares`; precisaremos adicionar estrutura JSON própria para dados normalizados.
- Parser deve ser resiliente a ruídos (menus/rodapés) e manter logs para debugging.
- Precisamos reutilizar `useModoColagem` sem quebrar fluxo de dados pessoais (categorias independentes).

### 3.2 Produto ✅

- Prioridade imediata: habilitar armazenamento dos dados escolares antes de evoluir toasts/UX secundários.
- Indicador de completude para escolares é apenas binário (importado ou não); contagem `X/Y` continua exclusiva para dados pessoais.

### 3.3 Perguntas em Aberto ⚠️

1. Precisamos guardar também o bloco “Histórico de Confirmação de Matrícula” como tabela estruturada ou apenas texto? (tendência: sim, seguir regra “guardar tudo que for da tela do aluno”.)
2. Existe alguma regra para quando “Recebe Escolarização em Outro Espaço” = "SIM"? Necessário notificar outro fluxo?
3. Como versionaremos múltiplas importações (logs)? Será tratado no documento CICLO/TECNICO.

---


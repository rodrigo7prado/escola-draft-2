# CONCEITO: Colagem de Dados Escolares

## 1. VISÃO GERAL

Funcionalidade que importa, verifica e armazena integralmente o conteúdo da aba “Dados Escolares” do sistema externo (dados de ingresso, escolaridade atual e histórico de renovação). Ela opera como uma categoria independente dentro do fluxo de colagem por texto, mas reutiliza os mesmos componentes, parsers e roteiros de confirmação já consolidados para dados pessoais. O resultado é um painel interno onde cada aluno passa a ter o histórico escolar completo preservado e auditável.

---

## 2. PROBLEMA QUE RESOLVE

**Antes:**

- Dados escolares permaneciam apenas no sistema externo, exigindo consultas manuais repetidas.
- O backend armazenava somente dados pessoais importados; histórico escolar não existia localmente.
- Usuários não possuíam nenhum indicador visual para saber se os dados escolares já haviam sido revisados.

**Depois (com esta funcionalidade):**

- Basta copiar o texto da aba “Dados Escolares” e colar no sistema; todo o conteúdo é interpretado automaticamente.
- Os campos são persistidos em estrutura própria (`dadosEscolares`) + texto bruto para auditoria.
- A lista de alunos exibe o estado da importação escolar (check verde/laranja), independente dos dados pessoais.

---

## 3. ESCOPO

### O que FAZ parte desta funcionalidade:

- [x] Capturar o texto bruto da aba “Dados Escolares” (incluindo menus e tabelas).
- [x] Normalizar blocos “Aluno”, “Dados de Ingresso”, “Escolaridade” e “Renovação de Matrícula”.
- [x] Unificar ano/período de ingresso com o histórico da tabela de renovação.
- [x] Persistir todos os campos relevantes e o texto original, vinculados ao aluno.
- [x] Atualizar indicadores na lista (dados pessoais `X/Y`, dados escolares `Importado/Pendente`).
- [x] Exibir seção somente leitura no modal de confirmação.

### O que NÃO FAZ parte (out of scope):

- [ ] Edição manual de dados escolares importados.
- [ ] Integração automática com APIs da SEEDUC-RJ.
- [ ] Sincronização periódica ou em lote; fluxo continua manual (colagem).
- [ ] Validação pedagógica (notas, frequência, desempenho).
- [ ] Geração de relatórios específicos a partir do histórico.

---

## 4. FLUXO DO USUÁRIO

1. Usuário seleciona um aluno na lista e visualiza botão de ativar colagem, assim como o botão de cópia de matrícula.
2. Com o auxílio do número da matrícula, copia o texto completo da aba “Dados Escolares” do sistema externo.
3. Cola o texto no painel; o backend identifica automaticamente a categoria e executa o parser dedicado.
4. O modal exibe os dados interpretados (ingresso, escolaridade atual e tabela de renovação) em modo leitura.
5. Usuário confirma a importação; o sistema salva dados estruturados e texto bruto.
6. O indicador escolar vira verde imediatamente após o salvamento bem-sucedido.
7. Caso o parsing falhe, o modal exibe o erro e mantém o indicador laranja.

Fluxos alternativos:

- Texto incompleto → bloqueio e orientação para copiar toda a seção, dando a dica do "ctrl + A".
- Usuário cola dados de outro aluno → validação de matrícula impede confirmação.
- Reimportação → substitui o bloco escolar inteiro e registra timestamp.

---

## 5. CONCEITOS-CHAVE

### 5.1 Bloco de Ingresso Consolidado

**Definição:** Conjunto de campos “Ano Ingresso”, “Período Ingresso”, “Data de Inclusão”, “Tipo Ingresso” e “Rede de Ensino Origem”.
**Por que existe:** Marca o início do histórico escolar e precisa ser preservado mesmo que não haja linhas correspondentes na tabela de renovação.
**Tratamento:** Sempre armazenado como objeto `ingresso`; ano/período são adicionados ao histórico caso ainda não existam.

### 5.2 Histórico Estruturado de Matrículas

**Definição:** Lista cronológica construída a partir da tabela “Renovação de Matrícula”, contendo ano letivo, período, unidade, curso, série, turno, ensino religioso, língua estrangeira, situação e tipo de vaga.
**Por que existe:** Permite rastrear a jornada do aluno e sustenta relatórios futuros sem depender do texto bruto.
**Tratamento:** Cada linha vira um item normalizado; o código de unidade é separado da descrição e valores vazios são registrados como `null`.

### 5.3 Indicador de Importação Escolar

**Definição:** Badge compacto exibido ao lado da matrícula informando se o bloco escolar já foi importado.
**Por que existe:** Oferece feedback imediato sobre a completude dos dados escolares, independente do progresso dos dados pessoais.
**Tratamento:** Mostra “Importado” em verde quando `dataImportacaoTextoDadosEscolares` é preenchida; mantém “Pendente” em laranja caso contrário.

---

## 6. REGRAS DE NEGÓCIO PRINCIPAIS

1. **Importação Integral:** todo o conteúdo entre “Dados Escolares” e o rodapé (`<< Anterior`) deve ser persistido, exceto menus externos não relacionados ao aluno.
2. **Somente Leitura:** os dados escolares exibidos no modal não podem ser editados manualmente; divergências só são corrigidas refazendo a colagem.
3. **Unicidade por Aluno:** cada confirmação substitui o bloco escolar inteiro do aluno, mantendo apenas o último estado + texto bruto para auditoria.
4. **Indicador Confiável:** o badge verde só pode ser exibido após sucesso no parsing e no salvamento (status HTTP 200).
5. **Histórico Completo:** ano/período presentes em “Dados de Ingresso” devem obrigatoriamente aparecer no array de histórico, criando uma linha sintética se necessário.

---

## 7. STAKEHOLDERS

| Stakeholder            | Interesse                                                          | Impacto |
| ---------------------- | ------------------------------------------------------------------ | ------- |
| Secretaria Escolar     | Registrar histórico completo sem depender do sistema externo       | Alto    |
| Time de Certificação   | Garantir que dados escolares estejam consolidados antes da emissão | Alto    |
| Coordenação Pedagógica | Visualizar jornada escolar e validar continuidade                  | Médio   |
| Produto / PO           | Planejar roadmap de colagens e acompanhar adoção por escola        | Médio   |
| Dev / QA               | Manter arquitetura de colagem consistente entre categorias         | Alto    |

---

## 8. MÉTRICAS DE SUCESSO

- ≥ 95% dos alunos com `dataImportacaoTextoDadosEscolares` preenchida antes do período de certificação.
- 0 reimportações fracassadas sem feedback ao usuário (todas as falhas devem gerar alerta).
- Tempo médio para colar e confirmar dados escolares ≤ 20 segundos para usuários treinados.
- Indicadores visuais refletem o estado real (sem falsos positivos) em auditorias semanais.

---

## 9. LIMITAÇÕES CONHECIDAS

1. **Dependência do Layout Externo:** qualquer alteração na tela oficial pode quebrar o parser; mitigação via testes e monitoramento.
2. **Sem sincronização automática:** novas atualizações no sistema externo exigem uma nova colagem manual.
3. **Ausência de edição granular:** ajustes pontuais em linhas específicas não são possíveis nesta fase.

---

## 10. EVOLUÇÃO FUTURA (ROADMAP)

- [ ] ESPECIFICAÇÃO CIF com checklist completo de validações.
- [ ] Documento TÉCNICO detalhando parser, APIs e structure JSON.
- [ ] Comparador visual entre importações (diff cronológico).
- [ ] Histórico de confirmações (log por usuário/data).
- [ ] Integração com futuras funcionalidades de certificação.

---

## REFERÊNCIAS

### 📋 Modelos de Colagem
- 📄 **[modelos/DadosEscolaresColagemModelo.md](./modelos/DadosEscolaresColagemModelo.md)** - Exemplo completo de texto colado do sistema oficial (Dados Escolares)

### 📚 Documentação Relacionada
- `CLAUDE.md` – Metodologia CIF e guia de uso.
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_*` – Base arquitetural da colagem de dados pessoais.
- Captura real da aba "Dados Escolares" (anexada na conversa de 14/11/2025).

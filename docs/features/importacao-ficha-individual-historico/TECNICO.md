# DECISÕES TÉCNICAS — IMPORTAÇÃO FICHA INDIVIDUAL - HISTÓRICO

- **Objetivo**: este arquivo guarda políticas globais e motivações; o registry de campos produtivos está em `src/lib/mapeamentos/importacaoFichaIndividualHistorico.ts`. Apenas metadados de IA podem ser alterados pelo agente.

## Regras globais de mapeamento
- Extração: preferir XML para dados de contexto/disciplinas quando disponível; usar XLSX (inlineStr/sharedStrings) para cabeçalhos visíveis. Headers podem vir com sufixo “.” ou variações como “%FR.” → remover pontuação/sufixos antes do match.
- Normalização padrão: datas dd/mm/aaaa → ISO; números de faltas/notas/pontos → int/float; strings → trim/upper quando não houver contraindicação explícita.
- Dedupe/vínculo: usar `NOME DO ALUNO` + `DATA DE NASCIMENTO` + escola/contexto (quando disponível). Ausência ou duplicidade deve marcar o arquivo como erro para revisão manual.
- Situação final: rótulo pode vir como frase longa (“À VISTA DOS RESULTADOS...”); interessa apenas o valor final da situação.

## Interação com metadados/IA
- Metadados residem em `iaMeta` (ou arquivo paralelo futuro) e podem conter status/perguntas/fonte/normalização sugerida. Campos produtivos não devem ser editados automaticamente.
- Fluxo esperado do agente: aplicar regras globais → consultar `iaMeta` para campos `[A DEFINIR]`/status “todo” → perguntar o necessário → preencher metas → gerar/atualizar CPs. Não alterar estrutura de domínio.

## Mensagens/erros-alvo
- Erros esperados: header/label não encontrado; valor fora do domínio; duplicidade na chave de vínculo; sheet ausente.
- Padrão de mensagem: curto, indicando campo e causa (ex.: “FREQUÊNCIA GLOBAL: valor fora do domínio [%]”).
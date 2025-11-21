# DECISÕES TÉCNICAS

## Sessão 1 - Refatorações iniciais

T1. Refatoração para eliminação de duplicação de código (GAP-2)
  T1.1. Criado arquivo parsingUtils.ts para centralizar funções compartilhadas entre parsers
  T1.2. Função normalizarTextoBase() foi extraída e agora é reutilizada por ambos parseDadosPessoais e parseDadosEscolares
  T1.3. Função normalizarTextoParaComparacao() criada com configurações opcionais (uppercase/lowercase, caracteres a remover, normalização de espaços)
  T1.4. Motivação: seguir princípio DRY conforme REUSO.md item 3 - eliminar duplicação e criar fonte única de verdade
  T1.5. Testes validados e passando após refatorações

## Sessão 2 - Integração do parser ao endpoint (Resolução GAP-5)

T2. Integração do parser de dados escolares ao endpoint de importação
  T2.1. Modificado endpoint src/app/api/importacao-estruturada/route.ts para usar parseDadosEscolares()
  T2.2. Implementada salvamento transacional dos dados parseados
    T2.2.1. Campos do aluno são atualizados na tabela Aluno (situação, causa encerramento, motivo, etc)
    T2.2.2. Séries cursadas são salvas na tabela SerieCursada
    T2.2.3. Texto bruto original mantido para auditoria (textoBrutoDadosEscolares)
  T2.3. Estratégia de atualização: delete-and-recreate para evitar duplicação
    T2.3.1. Séries existentes são deletadas antes de inserir novas
    T2.3.2. Motivação: evitar conflitos com constraint unique (alunoMatricula, modalidade, segmento, curso, serie)
    T2.3.3. Alternativa futura: implementar upsert inteligente preservando dados históricos
  T2.4. Tratamento de datas: campos de data são convertidos de string para Date quando presentes
  T2.5. Resposta do endpoint agora inclui dados parseados e contagem de séries cadastradas

## Sessão 3 - Expansão do detector de tipo de página (CP3.1)

T3. Melhoria do detectarTipoPagina para distinguir páginas com campos ambíguos
  T3.1. Problema identificado: Campo MATRÍCULA aparece em ambas páginas (pessoais e escolares)
  T3.2. Solução implementada: Remover campos ambíguos + adicionar marcadores exclusivos
    T3.2.1. Removido MATRÍCULA dos marcadores fortes de dados pessoais
    T3.2.2. Adicionados 9 marcadores exclusivos de dados escolares:
      - SITUAÇÃO: (Concluído, Cursando, etc)
      - CURSO: seguido de código (padrão 0023.29)
      - SÉRIE/ANO ESCOLAR:
      - MODALIDADE*:
      - NÍVEL/SEGMENTO*:
      - CAUSA DO ENCERRAMENTO:
      - DADOS DE INGRESSO
      - ANO INGRESSO:
      - REDE DE ENSINO ORIGEM:
  T3.3. Testes expandidos de 4 para 18 casos no total
    T3.3.1. Adicionados testes individuais para cada marcador forte
    T3.3.2. Teste com template completo DadosEscolaresColagemModelo.md
    T3.3.3. Teste de campo ambíguo (MATRÍCULA isolada retorna null)
  T3.4. Motivação: Páginas com Ctrl+A contêm campos de ambos tipos, necessário usar marcadores exclusivos
  T3.5. Todos os 110 testes passando
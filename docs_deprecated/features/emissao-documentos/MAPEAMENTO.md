# MAPEAMENTO DE CAMPOS - EMISSAO DE DOCUMENTOS

## Fontes usadas
- dadosPessoais.Aluno.*
- dadosEscolares.SerieCursada.*
- historicoEscolar.SerieCursada.*
- historicoEscolar.HistoricoEscolar.*
- INSTITUICAO_CONFIG.*
- Modalidades consideradas: NOVO ENSINO MEDIO, ENSINO MEDIO REGULAR (NEJA e outras nao consideradas)

## CERTIDAO (EMR)

### Campos variaveis -> fonte
- aluno.nome -> dadosPessoais.Aluno.nome
- aluno.rg -> dadosPessoais.Aluno.rg
- aluno.rgOrgaoEmissor -> dadosPessoais.Aluno.rgOrgaoEmissor
- aluno.nomeMae -> dadosPessoais.Aluno.nomeMae
- aluno.nomePai -> dadosPessoais.Aluno.nomePai
- aluno.naturalidade -> dadosPessoais.Aluno.naturalidade
- aluno.dataNascimento -> dadosPessoais.Aluno.dataNascimento
- aluno.dataConclusaoEnsinoMedio -> dadosPessoais.Aluno.dataConclusaoEnsinoMedio
- documento.cursoSegmento (MERGEFIELD F15) -> dadosEscolares.SerieCursada.segmento (valores: NOVO ENSINO MEDIO | ENSINO MEDIO REGULAR)
- documento.decreto (MERGEFIELD F18) -> INSTITUICAO_CONFIG.legislacao.decretos.EMR
- documento.observacao (MERGEFIELD F25) -> dadosPessoais.Aluno.observacoes
- documento.secretariaEscolar (MERGEFIELD F27) -> INSTITUICAO_CONFIG.secretariaEscolar
- documento.diretor (MERGEFIELD F30) -> INSTITUICAO_CONFIG.diretor
- documento.livroNumero -> INSTITUICAO_CONFIG.livros.CERTIDAO

### Discrepancias (sem fonte em def-objects)
- TODO: definir fonte dos campos de registro e emissao
- documento.registroNumero
- documento.registroFolha
- documento.dataEmissao
- documento.localEmissao (ex: Rio de Janeiro)

## CERTIFICADO (EMR)

### Campos variaveis -> fonte
- aluno.nome -> dadosPessoais.Aluno.nome
- aluno.rg -> dadosPessoais.Aluno.rg
- aluno.rgOrgaoEmissor -> dadosPessoais.Aluno.rgOrgaoEmissor
- aluno.nomeMae -> dadosPessoais.Aluno.nomeMae
- aluno.nomePai -> dadosPessoais.Aluno.nomePai
- aluno.naturalidade -> dadosPessoais.Aluno.naturalidade
- aluno.dataNascimento -> dadosPessoais.Aluno.dataNascimento
- aluno.dataConclusaoEnsinoMedio -> dadosPessoais.Aluno.dataConclusaoEnsinoMedio
- documento.cursoSegmento (MERGEFIELD F12) -> dadosEscolares.SerieCursada.segmento (valores: NOVO ENSINO MEDIO | ENSINO MEDIO REGULAR)
- documento.decreto (MERGEFIELD F18) -> INSTITUICAO_CONFIG.legislacao.decretos.EMR
- documento.cargaHorariaTotalHorasAula -> dadosEscolares.SerieCursada.cargaHorariaTotal
- documento.cargaHorariaTotalHoras -> derivado de cargaHorariaTotal
- documento.observacao (MERGEFIELD F26) -> dadosPessoais.Aluno.observacoes
- documento.secretariaEscolar (MERGEFIELD F32) -> INSTITUICAO_CONFIG.secretariaEscolar
- documento.diretor (MERGEFIELD F35) -> INSTITUICAO_CONFIG.diretor
- documento.livroNumero -> INSTITUICAO_CONFIG.livros.CERTIFICADO

### Discrepancias (sem fonte em def-objects)
- TODO: definir fonte dos campos de registro e emissao
- documento.registroNumero
- documento.registroFolha
- documento.dataEmissao
- documento.localEmissao (ex: Rio de Janeiro)
- TODO: definir conversao para horas (hoje so existe horas/aula)
- documento.cargaHorariaTotalHoras (nao ha campo dedicado)

## DIPLOMA

### Campos variaveis -> fonte
- documento.nomeInstituicao (MERGEFIELD F2) -> INSTITUICAO_CONFIG.nome
- aluno.nome -> dadosPessoais.Aluno.nome
- aluno.rg -> dadosPessoais.Aluno.rg
- aluno.rgOrgaoEmissor -> dadosPessoais.Aluno.rgOrgaoEmissor
- aluno.nomeMae -> dadosPessoais.Aluno.nomeMae
- aluno.nomePai -> dadosPessoais.Aluno.nomePai
- aluno.naturalidade -> dadosPessoais.Aluno.naturalidade
- aluno.dataNascimento -> dadosPessoais.Aluno.dataNascimento
- aluno.dataConclusaoEnsinoMedio -> dadosPessoais.Aluno.dataConclusaoEnsinoMedio
- documento.cursoSegmento (MERGEFIELD F12) -> dadosEscolares.SerieCursada.segmento (valores: NOVO ENSINO MEDIO | ENSINO MEDIO REGULAR)
- documento.decreto (MERGEFIELD F18) -> INSTITUICAO_CONFIG.legislacao.decretos.DIPLOMA
- documento.cargaHorariaTotalHorasAula -> dadosEscolares.SerieCursada.cargaHorariaTotal
- documento.cargaHorariaTotalHoras -> derivado de cargaHorariaTotal
- documento.livroNumero (MERGEFIELD F25) -> INSTITUICAO_CONFIG.livros.DIPLOMA
- documento.observacao (MERGEFIELD F26) -> dadosPessoais.Aluno.observacoes
- documento.secretariaEscolar (MERGEFIELD F32) -> INSTITUICAO_CONFIG.secretariaEscolar
- documento.diretor (MERGEFIELD F35) -> INSTITUICAO_CONFIG.diretor

### Discrepancias (sem fonte em def-objects)
- TODO: definir fonte dos campos de registro e emissao
- documento.registroNumero
- documento.registroFolha
- documento.dataEmissao
- documento.localEmissao (ex: Rio de Janeiro)
- TODO: definir conversao para horas (hoje so existe horas/aula)
- documento.cargaHorariaTotalHoras (nao ha campo dedicado)

## HISTORICO ESCOLAR (baseado em DadosAlunoHistorico.tsx)

### Campos variaveis -> fonte
- aluno.nome -> dadosPessoais.Aluno.nome
- aluno.matricula -> dadosPessoais.Aluno.matricula
- aluno.nomeSocial -> dadosPessoais.Aluno.nomeSocial
- aluno.dataNascimento -> dadosPessoais.Aluno.dataNascimento
- aluno.sexo -> dadosPessoais.Aluno.sexo
- aluno.cpf -> dadosPessoais.Aluno.cpf
- serie.anoLetivo -> historicoEscolar.SerieCursada.anoLetivo
- serie.periodoLetivo -> historicoEscolar.SerieCursada.periodoLetivo
- serie.segmento -> historicoEscolar.SerieCursada.segmento
- serie.serie -> historicoEscolar.SerieCursada.serie
- serie.cargaHorariaTotal -> historicoEscolar.SerieCursada.cargaHorariaTotal
- historico.componenteCurricular -> historicoEscolar.HistoricoEscolar.componenteCurricular
- historico.totalPontos -> historicoEscolar.HistoricoEscolar.totalPontos
- historico.cargaHoraria -> historicoEscolar.HistoricoEscolar.cargaHoraria

### Discrepancias (sem fonte em def-objects)
- TODO: decidir se historicoEscolar deve conter Aluno ou se usa dadosPessoais
- historicoEscolar nao contem secao Aluno; usar dadosPessoais ou adicionar Aluno em historicoEscolar

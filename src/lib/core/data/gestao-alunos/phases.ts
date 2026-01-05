const phases = {
    dadosPessoais: "FASE:DADOS_PESSOAIS",
    dadosEscolares: "FASE:DADOS_ESCOLARES",
    historicoEscolar: "FASE:HISTORICO_ESCOLAR",
    emissaoDocumentos: {
        titulo: "Emissão de Documentos",
        fase: "FASE:EMISSAO_DOCUMENTOS",
        modos: [
            { name: "Certificado/Certidão", lib: "SVG" },
            { name: "Apenas Certificado", lib: "SVG" },
            { name: "Apenas Certidão", lib: "SVG" },
            { name: "Histórico Escolar", lib: "SVG" },
        ]
    },
}

export default phases;
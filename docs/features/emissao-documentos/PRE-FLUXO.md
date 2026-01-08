## PRE-FLUXO

### PREMISSAS

PF1. O sistema deve permitir a emissão de certificado, certidão, histórico escolar e diploma, podendo ser emitido tanto pela aba de "Emissão de Documentos" nos dados de Gestão do Aluno, quanto pelo painel de Emissão de Documentos.

PF2. O Painel de Emissão do sistema deve permitir a emissão de documentos em lote, selecionando múltiplos alunos para emissão simultânea, preferencialmente por turmas ou cursos. O modo individual também deve estar disponível, e ficará em dados no painel de Gestão do Aluno.

PF3. Fundamental atentar-se que um objeto typescript (que já existe) será utilizado para controlar as regras de emissão dos documentos, bem como os campos utilizados em cada um deles.

PF4. Essa regra de campos, por exemplo, deverá estar corretamente articulada com o sistema de Validação de Completude de Dados que indicam a obrigatoriedade ou não de preenchimento de cada campo, conforme especificado na documentação de ícones.

PF5. Para todos os itens deste fluxo, avaliar criteriosamente quais elementos DRY serão usados, de forma a evitar repetição de código desnecessária, tudo conforme documentado em docs IDD/DRY.

### DEFINIÇÕES

PF6. Escolher criteriosamente qual biblioteca de geração de PDF será utilizada, considerando fatores como performance, facilidade de uso, compatibilidade com o framework atual e suporte a funcionalidades específicas necessárias para os documentos a serem emitidos.

PF7. Atentar-se para a criação de templates reutilizáveis para os documentos, garantindo que o design seja consistente e que futuras alterações possam ser feitas de forma eficiente.

PF8. Lembrar de pedir para fornecer os modelos oficiais dos documentos (certificado, certidão, histórico escolar) para garantir que o layout e as informações estejam corretas e em conformidade com as normas vigentes.

PF9. Alocar um espaço para escolher, na hora ou posteriormente, os metadados do documento, como nome da escola, nomes do diretor, secretária, logotipos, legislação, etc.

PF10. Alocar espaço para definir posteriormente o sistema de numeração dos documentos, que será baseado em Livro de Registro. Isso já dará conta da estratéia de armazenamento e controle dos documentos emitidos pelo sistema.

PF11. Quanto à biblioteca de geração de PDF, considerar o uso de uma biblioteca robusta e amplamente adotada, mas que não prenda o sistema a especificidades que possam dificultar futuras manutenções ou migrações. Discutir comigo antes a melhor opção com a equipe de desenvolvimento.

PF12. Quanto à estratégia de geração, será server-side, garantindo maior segurança e controle sobre o processo de emissão dos documentos.

### SOBRE OS CAMPOS
PF13. Os modelos estão em /docs/templates/arquivosDeExemplo/documentosEmissao/*.pdf e devem ser seguidos rigorosamente para garantir conformidade com as normas educacionais vigentes.
PF14. Os objetos definidores estão em [](/src/lib/core/data/gestao-alunos/def-objects/*);
PF15. Para cada documento, será observado o modelo e então os objetos de cada documento serão adequados ao que for encontrado nos modelos oficiais.
PF16. Posteriormente, esses objetos serão integrados ao sistema de Validação de Completude de Dados, garantindo que todos os campos obrigatórios estejam devidamente preenchidos antes da emissão dos documentos.

### OBJETO TS DE DEFINIÇÃO DE LAYOUT DOS DOCUMENTOS
PF17. Será criado um objeto typescript específico para definir o layout e os campos de cada tipo de documento (certificado, certidão, histórico escolar, diploma).
PF18. Esse objeto servirá como base para a geração dos documentos, garantindo que todas as informações necessárias estejam presentes e corretamente formatadas. O objeto também facilitará futuras alterações no layout ou nos campos dos documentos, permitindo uma manutenção mais ágil e eficiente.
PF19. As imagens utilizadas nos documentos (logotipos, selos, assinaturas) serão armazenadas em docs/templates/arquivoDeExemplo/documentosEmissao/imagens/*.

### EXPORTAÇÃO DOS DOCUMENTOS
PF20. Os formatos exportados dos documentos serão DOCX e PDF, garantindo compatibilidade e facilidade de uso para os usuários finais.
PF21. Haverá botões específicos para a impressão direta de cada documento e também para a impressão de todos do aluno selecionado.
Este documento cobre a integração dos módulos de importação com o backend do sistema, detalhando os processos, fluxos de dados e pontos de integração necessários para garantir uma operação eficiente e confiável.

# Integração de Importação DRY.BE
## Visão Geral
O módulo de importação do DRY.BE é responsável por gerenciar a ingestão, processamento e persistência de dados importados de diversas fontes, como arquivos CSV, XML, entre outros. A integração com o backend é projetada para ser modular e extensível, permitindo a adição de novos tipos de importação e perfis conforme necessário.
## Estratégia de Integração
1. **Endpoints de Importação**: Os endpoints RESTful são definidos no backend para receber arquivos de importação. Cada endpoint é associado a um perfil de importação específico, que define como os dados devem ser processados. Esta associação é feita em `src/lib/importer/csv/profiles/index.ts`.
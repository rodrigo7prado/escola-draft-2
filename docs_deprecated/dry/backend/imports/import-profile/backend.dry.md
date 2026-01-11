## Importação de Perfil
- [ ] *`DRY.BACKEND:IMPORT_PROFILE`*;
  - Descrição: Sistema de importação de perfis de importação;
  - Estrutura:
    - /lib/importer/*: lógica genérica de importação (engine);
    - /lib/parsers/*: parsers utilizados;
  - Princípios fundamentais:
    - Separação clara entre formato de importação e perfil de importação:
      - Sempre que possível, a estrutura de pastas favorecerá a separação (I) por formato para deixar claro o que é da lógica de formato e (II) por perfil (profiles) para deixar claro o que é da lógica específica de cada perfil;
      - Nada que seja específico de perfil pode residir no escopo destinado à lógica de formato.
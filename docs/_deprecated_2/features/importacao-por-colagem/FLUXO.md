*Escrita manual humana*

# F1. Fluxo de uso
F1.1. Usuário clica no aluno na lista de alunos
F1.2. Abrem dois botões: "Copiar matrícula" e "Ativar colagem"
F1.3. Usuário poderá copiar a matrícula para pesquisar no sistema externo e assim obter os dados desejados;
F1.4. Usuário clica em "Ativar colagem"
F1.5. Aparece um toast informando que o modo colagem está ativo com a dica de usar Ctrl+V para colar os dados
F1.6. Usuário cola os dados copiados do sistema externo (Ctrl+V)
F1.7. O sistema processa os dados colados e exibe em um modal de confirmação de dados, com eventuais inputs para dados que não foram possíveis de extrair
F1.8. Usuário confirma os dados
F1.9. O sistema salva os dados no backend e atualiza a interface do usuário

# F2. Preparação do backend
F2.1. Definir quais campos serão salvos no banco de dados (tabela de períodos cursados);
F2.2. Criar objeto reutilizável para representar estes campos;
F2.3. Criar estruturas de endpoints;
F2.4. Planejar os modelos de dados no Prisma e criar as migrações necessárias para ambos os ambientes (desenvolvimento e teste) com `migrate:all`;

# F3. Processamento dos dados colados
F3.1. O sistema detecta o tipo de página colada (dados escolares, dados pessoais, etc) usando o parser `detectarTipoPagina`;
F3.1.1. se for página de dados pessoais, usa o parser `parseDadosPessoais`; 
F3.1.2. se for página de dados escolares, o sistema usa o parser `parseDadosEscolares`; 

# F4. Metodologia comum de parseamento
F4.1. O parser recebe o texto colado como string
F4.2. Pré-processamento para remover dados de cabeçalho/rodapé, menus, focando apenas na seção relevante;
F4.3. O parser terá um objeto de configuração específico para cada tipo de página, contendo:
   F4.3.1. lista de campos que devem ser extraídos a fim de enviar ao banco de dados
   F4.3.2. padrões de regex para identificar seções e campos
   F4.3.3. mapeamentos de campos para os nomes usados no sistema, na ordem correta

# F5. Teste do parser
F5.1. Usar os modelos disponíveis em `docs/templates/DadosEscolaresColagemModelo.md` e `docs/templates/DadosPessoaisColagemModelo.md`
F5.2. Nos testes, garantir que o parser extrai os todos os dados corretamente

# F6. Orientações para o parser de dados escolares
F6.1. Uma vez que o parser dos dados pessoais presente em `src/lib/parsing/parseDadosPessoais.ts` foi implementado com sucesso, analisar e ter as estruturas do parser implementado de dados pessoais como base;
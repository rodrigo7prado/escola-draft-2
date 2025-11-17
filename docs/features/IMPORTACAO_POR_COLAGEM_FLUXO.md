# Fluxo de uso
1. Usuário clica no aluno na lista de alunos
2. Abrem dois botões: "Copiar matrícula" e "Ativar colagem"
3. Usuário poderá copiar a matrícula para pesquisar no sistema externo e assim obter os dados desejados;
4. Usuário clica em "Ativar colagem"
5. Aparece um toast informando que o modo colagem está ativo com a dica de usar Ctrl+V para colar os dados
6. Usuário cola os dados copiados do sistema externo (Ctrl+V)
7. O sistema processa os dados colados e exibe em um modal de confirmação de dados, com eventuais inputs para dados que não foram possíveis de extrair
8. Usuário confirma os dados
9. O sistema salva os dados no backend e atualiza a interface do usuário

# Preparação do backend
1. Definir quais campos serão salvos no banco de dados (tabela de períodos cursados);
2. Criar objeto reutilizável para representar estes campos;
3. Criar estruturas de endpoints;
4. Planejar os modelos de dados no Prisma e criar as migrações necessárias para ambos os ambientes (desenvolvimento e teste) com `migrate:all`;

# Processamento dos dados colados
1. O sistema detecta o tipo de página colada (dados escolares, dados pessoais, etc) usando o parser `detectarTipoPagina`;
1.1. se for página de dados pessoais, usa o parser `parseDadosPessoais`; 
1.2. se for página de dados escolares, o sistema usa o parser `parseDadosEscolares`; 

# Metodologia comum de parseamento
1. O parser recebe o texto colado como string
2. Pré-processamento para remover dados de cabeçalho/rodapé, menus, focando apenas na seção relevante;
3. O parser terá um objeto de configuração específico para cada tipo de página, contendo:
   - lista de campos que devem ser extraídos a fim de enviar ao banco de dados
   - padrões de regex para identificar seções e campos
   - mapeamentos de campos para os nomes usados no sistema, na ordem correta

# Teste do parser
1. Usar os modelos disponíveis em `docs/templates/DadosEscolaresColagemModelo.md` e `docs/templates/DadosPessoaisColagemModelo.md`
2. Nos testes, garantir que o parser extrai os todos os dados corretamente

# Orientações para o parser de dados escolares
1. Uma vez que o parser dos dados pessoais presente em `src/lib/parsing/parseDadosPessoais.ts` foi implementado com sucesso, analisar e ter as estruturas do parser implementado de dados pessoais como base;
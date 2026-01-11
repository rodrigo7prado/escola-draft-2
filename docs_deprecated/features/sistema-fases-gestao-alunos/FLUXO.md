# FLUXO DE USUÁRIO - Sistema de Fases de Gestão de Alunos

## Contexto
Incrementar o sistema de visualização e navegação das fases de gestão de alunos (Dados Pessoais, Dados Escolares, Histórico Escolar, Emissão de Documentos) através de ícones de status e abas no painel de dados do aluno.

## Fluxos

F1: Visualização de Status por Fase
F1.1: Na lista de alunos, cada aluno exibe ícones de status para todas as 4 fases
F1.2: Cada ícone indica visualmente o estado de completude da fase: completo (verde), incompleto (amarelo), ausente (vermelho)
F1.3: Os ícones são renderizados dinamicamente a partir do objeto de configuração de fases

F2: Navegação por Abas
F2.1: Ao selecionar um aluno, o painel de dados exibe abas para cada fase
F2.2: As abas são renderizadas dinamicamente a partir do objeto de configuração de fases
F2.3: Usuário pode navegar entre as abas para visualizar dados de diferentes fases
F2.4: Abas habilitadas com indicador visual de completude (conforme status da fase)

F3: Fonte Única de Configuração
F3.1: Toda a configuração de fases (ícones, títulos, ordem, abas) vem de um único objeto TypeScript
F3.2: Objeto localizado em [src/lib/core/data/gestao-alunos/phases.ts](../../../src/lib/core/data/gestao-alunos/phases.ts)
F3.3: Mudanças na configuração refletem automaticamente em ícones e abas
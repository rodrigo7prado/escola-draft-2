# Lógica de reuso do parser
1. O parser de dados escolares deve reutilizar a maior quantidade possível de lógica do parser de dados pessoais, presente em `src/lib/parsing/parseDadosPessoais.ts`.
2. Itens como pré-processamento do texto colado, detecção de padrões comuns e estrutura geral de parsing devem ser aproveitados.
3. Criar funções utilitárias compartilhadas para tarefas comuns entre os parsers, como extração de campos, validação de dados e manipulação de strings.
4. Garantir que ambos os parsers sigam uma arquitetura modular, permitindo fácil manutenção e extensão futura.
5. Documentar claramente as partes reutilizadas e as diferenças específicas do parser em [`TECNICO.md`](TECNICO.md) para facilitar futuras referências.
7. Manter sempre a SIMETRIA DE NOMENCLATURA e estrutura entre os dois parsers para facilitar o entendimento e a manutenção do código.
6. Testar exaustivamente o parser de dados escolares para assegurar que a reutilização da lógica não introduza erros ou inconsistências.

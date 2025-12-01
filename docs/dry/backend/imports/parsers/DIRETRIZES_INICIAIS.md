# DIRETRIZES INICIAIS PARA PARSERS
Este arquivo é apenas um guia inicial para a reformulação dos parsers no sistema.


## OBJETIVO
Definir diretrizes iniciais para a criação de um parser centralizado que possa lidar com múltiplos formatos de entrada (CSV, XML, TXT, XLSX) e aplicar regras específicas de extração, normalização e persistência de dados.

## DESAFIOS ATUAIS
- Ao mesmo tempo em que é necessário centralizar as lógicas dos parsers para evitar duplicação de código, cada parser possui regras específicas que precisam ser respeitadas.
- A diversidade de formatos de entrada exige uma abordagem ao mesmo tempo flexível mas também que contenha etapas e padrões claros para a extração de dados.

## CONSTRUÇÃO DE ESTRATÉGIAS
- Definir um pipeline claro com fases distintas: Extração, Normalização e Persistência.
- Cada etapa deve ser implementada como uma função separada, permitindo reutilização e manutenção mais fácil.
- Criar um mapeamento de campos que permita definir regras específicas para cada campo conforme o formato de entrada.

## DIRETRIZES INICIAIS PARA PARSERS
A refatoração dos parsers já implementados será feita em momento posterior. Mas isso não significa que não devemos considerar as suas características para a criação do parser centralizado.

## DETALHAMENTO TÉCNICO
O detalhamento técnico do parser por enquanto será documentado EXCLUSIVAMENTE no arquivo [`TECNICO.md`](/docs/features/parsers/TECNICO.md), que servirá como referência para a implementação do parser centralizado.

Importante: Favor IGNORAR qualquer outro arquivo que trate de aspectos técnicos dos parsers.
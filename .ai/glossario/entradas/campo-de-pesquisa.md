## GLOSSÁRIO DE CAMPO DE PESQUISA

### Campo de Pesquisa com Autocompletar
**Categoria**: [Campo de Pesquisa]
**Modo de chamada**: `Campo de Pesquisa com Autocompletar [Opções Ativáveis entre virgulas]`
**Descrição**: Campo de pesquisa que permite o uso de caracteres curinga ( * ) para ampliar ou refinar os resultados da busca, além de oferecer sugestões automáticas conforme o usuário digita.
**Opções Ativáveis**: 
 - `Curinga`: Permite o uso do caractere curinga ( * ) na pesquisa.
**Parâmetros**:
 - `Origem de Dados`: Define a fonte dos dados para sugestões (exemplo: nomes de alunos, matrículas, etc.).
  - Pode suportar múltiplas origens de dados para sugestões.
**Definições técnicas**:
 *Local do componente genérico*: [ainda não implementado]; // TODO
 *Comportamento esperado*: 
   - conforme o usuário digita, o sistema sugere possíveis correspondências baseadas nos caracteres inseridos em um dropdown abaixo do campo de pesquisa;
   - Utiliza algoritmos de correspondência de texto para sugerir resultados relevantes com base nas entradas parciais do usuário.
   - Permite navegação teclado (setas para cima/baixo, enter) para selecionar sugestões.
   - permite através de *Opções Ativáveis* o uso do caractere curinga ( * ) para substituir uma ou mais letras em termos de pesquisa;
   - o caractere curinga pode ser usado no início, meio ou fim de uma palavra para ampliar os resultados da busca;
  *Recursos Adicionais*:
   - Suporte para múltiplas origens de dados para sugestões; // Exemplo: nome do aluno, matrícula, etc.
   - Suporte para múltiplos curingas em uma única consulta;
   - Tratamento especial para evitar resultados irrelevantes quando curingas são usados em excesso.
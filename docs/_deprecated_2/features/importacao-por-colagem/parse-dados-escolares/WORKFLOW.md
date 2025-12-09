AVISO CRÍTICO: Em virtude do emburacamento infindável de falhas no parser de dados escolares, este checkpoint especial visa revisar ou, se necessário, reimplementar o parser `parseDadosEscolares` para garantir a correta extração e salvamento dos dados escolares colados pelos usuários, assim como a implementação dos testes associados.

ANTES DE IR PARA O CHECKPOINT, elaborarei a seguir algumas estratégias para abordar este problema, que dividirei em duas partes:

## PARTE 1: Princípios a se seguir

1. Vamos partir para uma estratégia, construída em conjunto, para escrever esse algoritmo do parse e seus objetos, sua estrutura, suas estratégias. Em detalhes.

2. Importante: o formato do aquivo de modelo para a colagem dos dados escolares do aluno [`DadosEscolaresColagemModelo`](./../../templates/DadosEscolaresColagemModelo.txt) foi alterado para txt. O motivo é que o formato anterior poderia estar induzindo o Claude a erros de interpretação. Por favor, utilize este arquivo txt como referência para o formato esperado dos dados colados.

3. Para ajuda no desenvolvimento dos testes, criei um json com os dados esperados para o modelo de colagem de dados escolares, que está em [`DadosEscolaresColagemModeloEsperado.json`](./../../templates/DadosEscolaresColagemModeloEsperado.json).

4. Algumas instruções quantos a este arquivo são:
  4.1. JAMAIS modifique o seu conteúdo para adequar ao parse.
  4.2. Quero estabelecer em conjunto com você como vamos validar estes dados.
  4.3. Se você precisar de ajuda para visualizar quais são os DADOS ESPERADOS, para adequar a estrutura do parse, especialmente na tabela, pode pedir.

5. Uma coisa que eu vi o Claude se debatendo de forma muito ineficiente foi com as lógicas de regex. Então vamos estabelecer uma estratégia bem estruturada para não cair nessas armadilhas.
A ordem dos dados na colagem são previsíveis, ou seja, serão sempre a mesma. Por isso, é bom estabecer as âncoras de antes e depois para identificar cada campo ao invés de tentar impôr regex simples. Crie os objetos sofisticados o suficiente para obter esses padrões de ordem de forma bem estruturada e organizada;
6. E, claro, muito cuidado com os valores possíveis de vazio ou textos que não serão considerados dados.

7. CRÍTICO: Se antes os dados da colagem de exemplo eram genéricos, dessa vez temos dados reais. Fiz assim para impedir qualquer tipo de ruído no procedimento de máscara de dados. 
8. Portanto, é FUNDAMENTAL que quando a solução for finalizada, os dados sejam transformados de volta para genéricos, para evitar exposição de dados sensíveis.


## PARTE 2: Parte crítica: tabela de Renovação de Matrícula
Este parser é particularmente complexo, especialmente no que se refere à extração da TABELA **Renovação de Matrícula**. Então vamos seguir uma série de passos para garantir que tudo seja feito corretamente.

1. O ponto mais problemático desta tabela é que na colagem não há delimitadores claros entre as colunas (tudo o que há são espaços). Portanto, precisamos estabelecer uma estratégia para identificar corretamente cada coluna.
2. Com base do json de dados esperados [`DadosEscolaresColagemModeloEsperado.json`](./../../templates/DadosEscolaresColagemModeloEsperado.json), vamos identificar as palavras-chave que marcam o início de cada coluna, MAS PRINCIPALMENTE, como separar os valores de cada coluna.
3. Para isso, sugiro a seguinte estratégia:
  3.1. Nós definiremos em algum lugar as possibilidades de valores para as colunas tidas como chave, como "Modalidade / Segmento / Curso", "Turno", "Situação" e "Tipo de Vaga".
  3.2. Alguns desses valores eu posso dar de antemão:
    - Turno: "M", "T", "N", "I", "A"
    - os valores de "Ensino Religioso" e "Língua Estrangeira" são sempre vazios, isto significa que na colagem há um espaço a mais nesses valores, que ficam juntos. Daí dá para identificar facilmente quando que são os valores dessas colunas.
  3.3. Agora os casos especiais:
    - para "Situação", o valor mais comum será "Possui confirmação",
    - para "Tipo de Vaga", o valor mais comum será "Vaga de Continuidade".
    - com essas informações, já é possível sanar a grande maioria dos casos.
    - mas nada garante que poderão haver outros valores. Então, para esses casos, sugiro a seguinte estratégia:
    - vamos criar no prisma, de alguma forma, em algum modelo, uma lista de valores conhecidos para essas colunas, de forma que possamos incrementar esses valores, quando novos forem encontrados.
4. Mas para os fins do teste, apenas o que eu já listei já é suficiente.
5. Com essas estratégias, acredito que conseguiremos extrair os dados da tabela de forma correta



# Sessão Especial (Revisão/Reimplementação do Parse de Dados Escolares)
Objetivo: Corrigir definitivamente o parser parseDadosEscolares, especialmente a extração da tabela de Renovação de Matrícula.

# DISPOSIÇÕES INICIAIS
1. Os dados importantes já estão no modelo de SeriesCursadas e Alunos no Prisma.
2. A partir daí será gerado o objeto de campos que serão distribuídos para os modelos, seja em Aluno, seja em Serie Cursada;
3. A partir deste mesmo objeto, serão direcionadas as transformações necessárias para salvar os dados no banco de dados;
4. As colagens são fixas, ou seja, a ordem dos campos é sempre a mesma;
5. O que muda, e pode confundir, são os valores, que podem ser vazios ou não, ou até mesmo com textos diferentes;
6. Portanto, o parser deve ser robusto o suficiente para lidar com essas variações de valores, mas sempre considerando a ordem fixa dos campos;
7. Ainda para os dados simples (os fora da tabela), quero que você dialogue comigo sobre a melhor forma de extrair esses dados, para garantir que não haja falhas de lógica e eficiência;


# CHECKPOINT ESPECIAL - PARSE_DADOS_ESCOLARES
Com o disposto abaixo, vamos definir o necessário para um algoritmo robusto e eficiente para o parser de dados escolares. Nos testes, o que for falhando, provavelmente será por algum ajuste simples nos objetos de controle de extração.

[x] CP_1: Os campos que importam estão nos modelos Prisma Aluno (os dados que não são pessoais) e SerieCursada;
[x] CP_2: Formar um objeto com esses dados, que terá propriedades que  e outras operações;
  [x] TEC_2.1: facilitarão o regex, segundo lógica especificada adiante;
  [x] TEC_2.2: mapearão para os modelos Prisma;
[x] TEC_3: Dentro da string colada, blocos, labels e valores seguem os seguintes padrões:
  TEC_3.1: CAMPOS SIMPLES (fora de tabela):
    A. Blocos: 
      a. Em dados pessoais, os blocos são:
        - "Informe a matrícula ou o nome do aluno",
        - "Dados Pessoais", 
        - "Necessidade Especial/Transtorno"
        - "Filiação",
        - "Endereço",
        - "Localização",
        - "Contato",
        - "Documentos",
        - "Dados da operadora de cartões",
        - "Outros documentos",
        - "Outras informações",
        - "Certidão Civil";
      b. Em dados escolares, os blocos são:
        - "Informe a matrícula ou o nome do aluno",
        - "Aluno",
        - "Dados de Ingresso",
        - "Escolaridade",
        - "Confirmação/Renovação de Matrícula",
        - "Imprimir fichas de matrícula";
    B. Labels. Toda string que contiver ":" ou ":*" são labels, exceto:
      - "Nota:", que se trata de algum aviso ou instrução;
      - ":" que estiverem no formato de hora (ex: "11:45:07");
    C. Existem caixas de seleção, que até o momento não estamos usando (e também os valores não são transferidos na colagem). Elas são:
      - "Aluno(a) com transtorno(s) que impacta(m) no desenvolvimento da aprendizagem?", sim ou não;
      - "Possui irmão matriculado na rede estadual de ensino.", que é uma caixa de seleção;
      - "Não se aplica
        Comunidade quilombola
        Área onde se localizam povos e comunidades tradicionais
        Área de assentamento
        Terra indígena", que são caixas de seleção;
    D. Valores:
      a. Valores em geral são tudo o que vem depois de uma label, exceto quando o valor seguinte for:
        a.1. outra label (ou seja, o valor é vazio);
        a.2. um bloco (ou seja, o valor é vazio);
        a.3. elementos estranhos, que serão listados adiante.
      b. Há casos em que o valor é duplo, ou seja, há dois valores para uma mesma label. Em geral, o primeiro valor é o código, o segundo é o valor descritivo. Portanto, se o campo no modelo Prisma tiver código, será este primeiro o valor do código e o segundo o descritivo. Caso contrário, será o segundo valor o valor do campo.
        - Isto acontece também com Aluno: matrícula (que é na prática o código do aluno) e o nome do aluno;
    E. Elementos estranhos, que serão ignorados:
      - Cabeçalhos, rodapés e menus de navegação, que podem aparecer em qualquer lugar do texto colado. Estes elementos devem ser removidos no pré-processamento, conforme já implementado no parseDadosPessoais.
      - "v" sozinho, que indica um dropdown;
      - "(Preencher sem abreviações)";
      - "Saiba Mais";
  TEC_3.2: TABELA DE RENOVAÇÃO DE MATRÍCULA:
    a. A tabela começa logo após a label "Renovação de Matrícula"
    b. As colunas da tabela são, na ordem:
      - Ano Letivo
      - Período Letivo
      - Unidade de Ensino
      - Modalidade / Segmento / Curso
      - Série/Ano Escolar
      - Turno
      - Ensino Religioso
      - Língua Estrangeira
      - Situação
      - Tipo de Vaga
    c. Os valores são um caso mais complexo, porque o que os separa são apenas um espaço em branco. Por isso, alguns critérios seguirão:
      c.1. A ordem das colunas é fixa;
      c.2. Alguns valores são conhecidos, como  "Série/ Ano Escolar", "Turno";
        c.2.1. "Turno" tem valores conhecidos: "M", "T", "N", "I", "A";
        c.2.2. "Série/Ano Escolar" é sempre um valor numérico, de apenas um dígito (1, 2, 3, etc), e precede o valor de "Turno";
      c.3. Alguns valores são sempre vazios, como "Ensino Religioso" e "Língua Estrangeira";
      c.4. "Situação" e "Tipo de Vaga" trarão uma necessidade especial, porque embora quase sempre eles serão "Possui confirmação" e "Vaga de Continuidade", respectivamente, podem haver outros valores. Portanto, criaremos listas de valores conhecidos para essas colunas, que poderão ser incrementadas futuramente.
        c.4.1. Mas caso os valores diferentes surjam para esses campos, o parser deverá emitir um aviso na tela, para que o usuário saiba que um valor inesperado foi encontrado.
        c.4.2. Se o parser conseguir seguir a ordem das colunas, mesmo com valores inesperados, ele poderá prosseguir normalmente.
        c.4.3. Caso contrário, o parser deverá emitir um erro e abortar a extração dos dados da tabela.
    d. As colunas não possuem delimitadores claros, apenas espaços. Portanto, a extração deve ser feita com base em âncoras e valores conhecidos:
      d.1. "Modalidade / Segmento / Curso": tudo até o próximo espaço antes da Série/Ano Escolar;
      d.2. "Série/Ano Escolar": tudo até o próximo espaço antes do Turno;
      d.3. "Turno": valores possíveis são "M", "T", "N", "I", "A";
      d.4. "Matricula": tudo até o próximo espaço antes da Situação;
      d.5. "Situação": valor mais comum é "Possui confirmação";
      d.6. "Tipo de Vaga": valor mais comum é "Vaga de Continuidade";
      d.7. "Ensino Religioso": geralmente vazio, indicado por espaço extra;
      d.8. "Língua Estrangeira": geralmente vazio, indicado por espaço extra;
[x] CP_4: da transferência dos dados extraídos para os modelos Prisma:
  [x] TEC_4.1: Há uma particularidade na construção dos dados extraídos para o modelo SerieCursada:
    [x] TEC_4.1.1. Para cada atualização de séries cursadas, criaremos uma instância dos dados de ingresso mais a instância de SerieCursada com os dados extraídos da linha da tabela. Essa totalidade de dados formará o objeto a ser salvo no banco de dados;
    [x] TEC_4.1.2. Nos blocos Dados de Ingresso e Escolaridade, há campos que também devem ser atribuídos a cada instância de SerieCursada (aliás, este registro será o primeiro a ser incluído):
      a. Ano de ingresso será adicionado como Ano Letivo;
      b. Período de ingresso será adicionado como Período Letivo;
      c. Unidade de Ensino será adicionado como Unidade de Ensino;
      d. Turno em Escolaridade está por extenso, e deverá ser mapeado para o valor curto usado na tabela (ex: "MANHÃ" → "M");
      e. Na tabela, um campo inteiro (Modalidade / Segmento / Curso) será mapeado para três campos string separados no modelo SerieCursada: Modalidade, Segmento e Curso; no bloco Escolaridade, os campos estão separados: "Nível/Segmento" corresponde a Segmento.
    [x] TEC_4.1.3. Cada linha da tabela de Renovação de Matrícula corresponde a uma instância do modelo SerieCursada, e serão os registros adicionados após o registro inicial do ingresso;
      
[x] CP_5: Testes unitários e de integração:
  [x] TEC_5.1: Criar casos de teste unitários para o parser parseDadosEscolares, utilizando o modelo de colagem de dados escolares como base;
  [x] TEC_5.2: Implementar testes de integração para garantir que os dados extraídos sejam corretamente salvos no banco de dados.

# PASSOS A SEGUIR
1. Testes
2. Uma vez passando os testes, anonimizar os dados do modelo de colagem, para evitar exposição de dados sensíveis.
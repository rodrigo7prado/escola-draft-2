// usar como base /docs/templates/DadosEscolaresEsperadosModelo.txt

type Objeto = {
  campoDoBancoDeDados: string;
  strLabel: string;
};

const objeto: Objeto[] = [
  {
    campoDoBancoDeDados: "aluno", // ou matrícula, etc
    strLabel: "Aluno:*",
  },
  {
    campoDoBancoDeDados: "matricula",
    strLabel: "Matrícula:*",
  },
  {
    campoDoBancoDeDados: "situacao",
    strLabel: "Situação:*",
  }
]
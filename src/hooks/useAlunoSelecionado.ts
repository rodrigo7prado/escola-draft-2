import { useState } from 'react';

type Aluno = {
  id: string;
  matricula: string;
  nome: string | null;
  sexo: string | null;
  dataNascimento: Date | null;
  nacionalidade: string | null;
  naturalidade: string | null;
  uf: string | null;
  rg: string | null;
  rgOrgaoEmissor: string | null;
  rgDataEmissao: Date | null;
  cpf: string | null;
  nomeMae: string | null;
  nomePai: string | null;
  dataConclusaoEnsinoMedio: Date | null;
  certificacao: boolean;
  dadosConferidos: boolean;
  efInstituicao: string | null;
  efMunicipioEstado: string | null;
  efAnoConclusao: number | null;
  efNumeroPagina: string | null;
  efDataEmissao: Date | null;
  observacoes: string | null;
  origemTipo: string;
  fonteAusente: boolean;
};

export function useAlunoSelecionado() {
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);

  const selecionarAluno = (aluno: Aluno | null) => {
    setAlunoSelecionado(aluno);
  };

  const limparSelecao = () => {
    setAlunoSelecionado(null);
  };

  return {
    alunoSelecionado,
    selecionarAluno,
    limparSelecao,
    temAlunoSelecionado: Boolean(alunoSelecionado)
  };
}

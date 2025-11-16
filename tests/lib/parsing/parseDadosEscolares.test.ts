import { describe, expect, it } from "vitest";
import { parseDadosEscolares } from "@/lib/parsing/parseDadosEscolares";

const TEXTO_ESCOLAR = `
Aluno
Matrícula:*	202212345678901
Situação:	Concluido
Motivo:
CONCLUINTE
Recebe Escolarização em Outro Espaço (diferente da escola)? :*
NÃO RECEBE

Dados de Ingresso
Ano Ingresso:*	<2022>
Período Ingresso:*	0
Data de Inclusão do Aluno:	11/01/2022 11:45:07
Tipo Ingresso:*	Outros
Rede de Ensino Origem:*	Estadual

Escolaridade
Unidade de Ensino:*	33063397	CE SENOR ABRAVANEL
Nível/Segmento*:	MÉDIO
Modalidade*:	REGULAR
Curso:*	0023.29	NEM ITINERÁRIO FORMATIVO BLOCO TEMÁTICO LGG+CHS - CIDADANIA ATIVA
Turno:*	MANHÃ
Matriz Curricular:*	NEM_IF_LGG+CHS_01_24
Série/Ano Escolar:*	ENSINO MÉDIO REGULAR - 3ª SÉRIE

Renovação de Matrícula
Ano Letivo	Período Letivo	Unidade de Ensino	Modalidade / Segmento / Curso	Série/Ano Escolar	Turno	Ensino Religioso	Língua Estrangeira Facultativa	Situação	Tipo Vaga
2024	0	33063397 - CE SENOR ABRAVANEL	REGULAR / MÉDIO / NEM ITINERÁRIO FORMATIVO BLOCO TEMÁTICO LGG+CHS - CIDADANIA ATIVA	3	M			Possui confirmação	Vaga de Continuidade
2023	0	33062222 - CE ANTONIO PRADO JUNIOR	REGULAR / MÉDIO / NEM ITINERÁRIO FORMATIVO DE LINGUAGENS	2	T			Possui confirmação	Vaga de Continuidade
Página 1 de 1 (2 itens)
<< Anterior
`;

describe("parseDadosEscolares", () => {
  it("deve extrair séries cursadas e dados principais", () => {
    const resultado = parseDadosEscolares(TEXTO_ESCOLAR, "202212345678901");

    expect(resultado.alunoInfo.anoIngresso).toBe(2022);
    expect(resultado.alunoInfo.periodoIngresso).toBe(0);
    expect(resultado.alunoInfo.matrizCurricular).toBe("NEM_IF_LGG+CHS_01_24");
    expect(resultado.alunoInfo.motivoEncerramento).toBe("CONCLUINTE");
    expect(resultado.series).toHaveLength(2);

    const primeira = resultado.series[0];
    expect(primeira.anoLetivo).toBe("2022"); // substituído pelos dados de ingresso
    expect(primeira.periodoLetivo).toBe("0");
    expect(primeira.modalidade).toBe("REGULAR");
    expect(primeira.segmento).toBe("MÉDIO");
    expect(primeira.curso).toMatch(/LGG\+CHS/);
    expect(primeira.matrizCurricular).toBe("NEM_IF_LGG+CHS_01_24");
    expect(primeira.redeEnsinoOrigem).toBe("Estadual");

    const segunda = resultado.series[1];
    expect(segunda.anoLetivo).toBe("2023");
    expect(segunda.periodoLetivo).toBe("0");
    expect(segunda.codigoEscola).toBe("33062222");
  });

  it("deve lançar erro se matrícula não corresponder", () => {
    expect(() =>
      parseDadosEscolares(TEXTO_ESCOLAR, "000000000000000")
    ).toThrow("Matrícula do texto não corresponde ao aluno ativo");
  });

  it("deve lançar erro se faltar tabela de renovação", () => {
    const textoSemTabela = TEXTO_ESCOLAR.replace(
      /Renovação de Matrícula[\s\S]+<< Anterior/,
      "Renovação de Matrícula\n<< Anterior"
    );

    expect(() =>
      parseDadosEscolares(textoSemTabela, "202212345678901")
    ).toThrow("Tabela 'Renovação de Matrícula' não encontrada");
  });
});

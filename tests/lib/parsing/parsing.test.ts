/**
 * Testes do módulo de parsing - Importação Estruturada
 *
 * Testa os 3 parsers principais:
 * - detectarTipoPagina: Identifica tipo de texto colado
 * - normalizarSexo: Normaliza valor de sexo para M/F
 * - parseDadosPessoais: Extrai todos os 32 campos
 */

import { detectarTipoPagina } from '@/lib/parsing/detectarTipoPagina';
import { parseDadosPessoais } from '@/lib/parsing/parseDadosPessoais';
import { normalizarSexo } from '@/lib/parsing/normalizarSexo';

// ============================================================================
// TESTES: detectarTipoPagina
// ============================================================================

describe('detectarTipoPagina', () => {
  it('deve detectar dados pessoais corretamente', () => {
    const texto = `
NOME COMPLETO: JOÃO SILVA
MATRÍCULA: 123456789012345
DATA DE NASCIMENTO: 01/01/2005
`;
    expect(detectarTipoPagina(texto)).toBe('dadosPessoais');
  });

  it('deve detectar dados escolares corretamente', () => {
    const texto = `
COMPONENTE CURRICULAR          CH    NOTA  FREQ  RESULTADO
LÍNGUA PORTUGUESA              160   7.5   85%   APROVADO
`;
    expect(detectarTipoPagina(texto)).toBe('dadosEscolares');
  });

  it('deve retornar null para texto vazio', () => {
    expect(detectarTipoPagina('')).toBe(null);
  });

  it('deve lançar erro para texto ambíguo', () => {
    const texto = `
NOME COMPLETO: TESTE
COMPONENTE CURRICULAR
`;
    expect(() => detectarTipoPagina(texto)).toThrow('múltiplos formatos');
  });
});

// ============================================================================
// TESTES: normalizarSexo
// ============================================================================

describe('normalizarSexo', () => {
  it('deve normalizar "Masculino" para "M"', () => {
    expect(normalizarSexo('Masculino')).toBe('M');
    expect(normalizarSexo('masculino')).toBe('M');
    expect(normalizarSexo('MASCULINO')).toBe('M');
  });

  it('deve normalizar "Feminino" para "F"', () => {
    expect(normalizarSexo('Feminino')).toBe('F');
    expect(normalizarSexo('feminino')).toBe('F');
    expect(normalizarSexo('FEMININO')).toBe('F');
  });

  it('deve aceitar "M" direto', () => {
    expect(normalizarSexo('M')).toBe('M');
    expect(normalizarSexo('m')).toBe('M');
  });

  it('deve aceitar "F" direto', () => {
    expect(normalizarSexo('F')).toBe('F');
    expect(normalizarSexo('f')).toBe('F');
  });

  it('deve retornar undefined para valor inválido', () => {
    expect(normalizarSexo('X')).toBeUndefined();
    expect(normalizarSexo('Outro')).toBeUndefined();
    expect(normalizarSexo('')).toBeUndefined();
  });
});

// ============================================================================
// TESTES: parseDadosPessoais
// ============================================================================

describe('parseDadosPessoais', () => {
  it('deve parsear campos básicos corretamente', () => {
    const texto = `
NOME: JOÃO SILVA SANTOS
DATA DE NASCIMENTO: 01/01/2005
SEXO: Masculino
NACIONALIDADE: Brasileira
NATURALIDADE: 00001404 RIO DE JANEIRO
`;

    const resultado = parseDadosPessoais(texto);

    expect(resultado.nome).toBe('JOÃO SILVA SANTOS');
    expect(resultado.dataNascimento).toBe('01/01/2005');
    expect(resultado.sexo).toBe('M'); // Normalizado
    expect(resultado.nacionalidade).toBe('Brasileira');
    expect(resultado.naturalidade).toBe('RIO DE JANEIRO'); // Código removido
  });

  it('deve extrair CPFs usando contexto posicional', () => {
    const texto = `
NOME DA MÃE: MARIA SILVA
CPF: 111.222.333-44
NOME DO PAI: JOSÉ SANTOS
CPF: 555.666.777-88
TIPO: RG
CPF: 999.888.777-66
NÚMERO: 12345678
`;

    const resultado = parseDadosPessoais(texto);

    expect(resultado.cpfMae).toBe('11122233344'); // Sem formatação
    expect(resultado.cpfPai).toBe('55566677788');
    expect(resultado.cpf).toBe('99988877766'); // CPF do aluno (próximo a TIPO/RG)
  });

  it('deve extrair dados de documentos', () => {
    const texto = `
TIPO: RG
NÚMERO: 12.345.678-9
ÓRGÃO EMISSOR: DETRAN
DATA DE EXPEDIÇÃO: 15/03/2020
ESTADO: RJ
`;

    const resultado = parseDadosPessoais(texto);

    expect(resultado.tipoDocumento).toBe('RG');
    expect(resultado.rg).toBe('12.345.678-9');
    expect(resultado.orgaoEmissor).toBe('DETRAN');
    expect(resultado.dataEmissaoRG).toBe('15/03/2020');
    expect(resultado.estadoEmissao).toBe('RJ');
  });

  it('deve extrair dados de filiação', () => {
    const texto = `
NOME DA MÃE: MARIA SILVA
CPF: 111.222.333-44
NOME DO PAI: JOSÉ SANTOS
CPF: 555.666.777-88
`;

    const resultado = parseDadosPessoais(texto);

    expect(resultado.nomeMae).toBe('MARIA SILVA');
    expect(resultado.cpfMae).toBe('11122233344');
    expect(resultado.nomePai).toBe('JOSÉ SANTOS');
    expect(resultado.cpfPai).toBe('55566677788');
  });

  it('deve extrair dados de certidão civil', () => {
    const texto = `
TIPO CERTIDÃO CIVIL: Nascimento
CERTIDÃO CIVIL: 123456
UF DO CARTÓRIO: RJ
MUNICÍPIO DO CARTÓRIO: Rio de Janeiro
CARTÓRIO: 1º Ofício
NÚMERO DO TERMO: 789
DATA DE EMISSÃO: 10/01/2005
ESTADO: RJ
FOLHA: 12
LIVRO: A-100
`;

    const resultado = parseDadosPessoais(texto);

    expect(resultado.tipoCertidaoCivil).toBe('Nascimento');
    expect(resultado.numeroCertidaoCivil).toBe('123456');
    expect(resultado.ufCartorio).toBe('RJ');
    expect(resultado.municipioCartorio).toBe('Rio de Janeiro');
    expect(resultado.nomeCartorio).toBe('1º Ofício');
    expect(resultado.numeroTermo).toBe('789');
    expect(resultado.dataEmissaoCertidao).toBe('10/01/2005');
    expect(resultado.estadoCertidao).toBe('RJ');
    expect(resultado.folhaCertidao).toBe('12');
    expect(resultado.livroCertidao).toBe('A-100');
  });

  it('deve extrair contato (email)', () => {
    const texto = `
E-MAIL: aluno@example.com
`;

    const resultado = parseDadosPessoais(texto);

    expect(resultado.email).toBe('aluno@example.com');
  });

  it('deve lidar com campos ausentes', () => {
    const texto = `
NOME: TESTE MÍNIMO
`;

    const resultado = parseDadosPessoais(texto);

    expect(resultado.nome).toBe('TESTE MÍNIMO');
    expect(resultado.sexo).toBeUndefined();
    expect(resultado.cpf).toBeUndefined();
    expect(resultado.rg).toBeUndefined();
    expect(resultado.email).toBeUndefined();
  });

  it('deve normalizar sexo automaticamente', () => {
    const textoMasculino = 'SEXO: Masculino';
    const textoFeminino = 'SEXO: Feminino';

    expect(parseDadosPessoais(textoMasculino).sexo).toBe('M');
    expect(parseDadosPessoais(textoFeminino).sexo).toBe('F');
  });

  it('deve retornar undefined para sexo inválido', () => {
    const texto = 'SEXO: Outro';
    const resultado = parseDadosPessoais(texto);

    expect(resultado.sexo).toBeUndefined();
  });

  it('deve remover código da naturalidade', () => {
    const texto = 'NATURALIDADE: 00001404 IPU';
    const resultado = parseDadosPessoais(texto);

    expect(resultado.naturalidade).toBe('IPU'); // Código removido
  });

  it('deve remover formatação de todos os CPFs', () => {
    const texto = `
NOME DA MÃE: MARIA
CPF: 111.222.333-44
NOME DO PAI: JOSÉ
CPF: 555.666.777-88
TIPO: RG
CPF: 999.888.777-66
`;

    const resultado = parseDadosPessoais(texto);

    expect(resultado.cpfMae).toBe('11122233344');
    expect(resultado.cpfPai).toBe('55566677788');
    expect(resultado.cpf).toBe('99988877766');
  });

  it('deve parsear texto completo (exemplo real)', () => {
    const textoCompleto = `
NOME: ANDRÉ RODRIGUES DE SOUSA FILHO
DATA DE NASCIMENTO: 29/03/2007
SEXO: Masculino
NATURALIDADE: 00001404 IPU
NACIONALIDADE: Brasileira
UF DE NASCIMENTO: CE
NOME DA MÃE: LUIZA MÁRCIA SOUSA RODRIGUES
CPF: 031.491.753-56
NOME DO PAI: ANDRÉ RODRIGUES DE SOUSA
CPF: 206.119.417-67
TIPO: RG
NÚMERO: 297398208
ESTADO: RJ
ÓRGÃO EMISSOR: DETRAN
DATA DE EXPEDIÇÃO: 05/09/2012
`;

    const resultado = parseDadosPessoais(textoCompleto);

    // Dados cadastrais
    expect(resultado.nome).toBe('ANDRÉ RODRIGUES DE SOUSA FILHO');
    expect(resultado.dataNascimento).toBe('29/03/2007');
    expect(resultado.sexo).toBe('M');
    expect(resultado.naturalidade).toBe('IPU');
    expect(resultado.nacionalidade).toBe('Brasileira');
    expect(resultado.uf).toBe('CE');

    // Filiação
    expect(resultado.nomeMae).toBe('LUIZA MÁRCIA SOUSA RODRIGUES');
    expect(resultado.cpfMae).toBe('03149175356');
    expect(resultado.nomePai).toBe('ANDRÉ RODRIGUES DE SOUSA');
    expect(resultado.cpfPai).toBe('20611941767');

    // Documentos (CPF do aluno aparece próximo a TIPO/RG, mas não está no exemplo)
    expect(resultado.tipoDocumento).toBe('RG');
    expect(resultado.rg).toBe('297398208');
    expect(resultado.estadoEmissao).toBe('RJ');
    expect(resultado.orgaoEmissor).toBe('DETRAN');
    expect(resultado.dataEmissaoRG).toBe('05/09/2012');
  });
});
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
  const COLAGEM_DADOS_PESSOAIS = `
Dados Pessoais
Sem foto
Nome:*    
MARIA TESTE DA SILVA
Nome Social:    
 Saiba Mais
Data Nascimento:*    
03/04/2005
Sexo:*    
Masculino    Feminino
Estado Civil:*    
Solteiro
País de Nascimento:*    
BRASIL
Nacionalidade:*    
BRASILEIRA
UF de Nascimento:*    
SP
Naturalidade:*    
00001234
SÃO PAULO

Necessidade Especial:*    
Não possui.
 Saiba Mais

Filiação
Nome da Mãe:*    
ANA TESTE LIMA
Não Declarada    Falecida    CPF:    
012.345.678-90

Nome do Pai:*    
PAULO TESTE LIMA
Não Declarado    Falecido    CPF:    

Contato
E-mail:    
aluna.teste@example.com

Dados da operadora de cartões
Login    
responsavel@example.com

Outros Documentos
CPF:    
987.654.321-00
Tipo:    
RG
Número*:    
11223344
Complemento da identidade:    
SSP
Estado*:    
SP
Órgão Emissor*:    
SSP
Data de Expedição*:    
15/08/2018

Certidão Civil
Tipo Certidão Civil:*    
Nascimento
Certidão Civil:*    
Modelo Antigo
UF do Cartório:    
SP
Município do Cartório:    
SÃO PAULO
Cartório:    
1º OFÍCIO DE REGISTRO CIVIL
Número do Termo:    
9000
Data de Emissão:    
17/08/2005
Estado:    
SP
Folha:    
45
Livro:    
0012

Próximo >>
`.trim();
  it('deve parsear campos básicos corretamente', () => {
    const texto = `
NOME: JOÃO SILVA SANTOS
DATA DE NASCIMENTO: 01/01/2005
SEXO: Masculino
NACIONALIDADE: Brasileira
UF DE NASCIMENTO: RJ
NATURALIDADE: 00001404 RIO DE JANEIRO
`;

    const resultado = parseDadosPessoais(texto);

    expect(resultado.nome).toBe('JOÃO SILVA SANTOS');
    expect(resultado.dataNascimento).toBe('01/01/2005');
    expect(resultado.sexo).toBe('M'); // Normalizado
    expect(resultado.nacionalidade).toBe('Brasileira');
    expect(resultado.uf).toBe('RJ');
    expect(resultado.naturalidade).toBe('RIO DE JANEIRO'); // Código removido
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
NACIONALIDADE: Brasileira
UF DE NASCIMENTO: CE
NATURALIDADE: 00001404 IPU
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

  it('deve parsear colagem real preservando ordem fixa e placeholders', () => {
    const resultado = parseDadosPessoais(COLAGEM_DADOS_PESSOAIS);

    expect(resultado.nome).toBe('MARIA TESTE DA SILVA');
    expect(resultado.nomeSocial).toBeUndefined();
    expect(resultado.dataNascimento).toBe('03/04/2005');
    expect(resultado.sexo).toBeUndefined();
    expect(resultado.estadoCivil).toBe('Solteiro');
    expect(resultado.paisNascimento).toBe('BRASIL');
    expect(resultado.nacionalidade).toBe('BRASILEIRA');
    expect(resultado.uf).toBe('SP');
    expect(resultado.naturalidade).toBe('SÃO PAULO');
    expect(resultado.necessidadeEspecial).toBe('Não possui.');

    expect(resultado.nomeMae).toBe('ANA TESTE LIMA');
    expect(resultado.cpfMae).toBe('01234567890');
    expect(resultado.nomePai).toBe('PAULO TESTE LIMA');
    expect(resultado.cpfPai).toBeUndefined();

    expect(resultado.email).toBe('aluna.teste@example.com');
    expect(resultado.cpf).toBe('98765432100');
    expect(resultado.tipoDocumento).toBe('RG');
    expect(resultado.rg).toBe('11223344');
    expect(resultado.complementoIdentidade).toBe('SSP');
    expect(resultado.estadoEmissao).toBe('SP');
    expect(resultado.orgaoEmissor).toBe('SSP');
    expect(resultado.dataEmissaoRG).toBe('15/08/2018');

    expect(resultado.tipoCertidaoCivil).toBe('Nascimento');
    expect(resultado.numeroCertidaoCivil).toBe('Modelo Antigo');
    expect(resultado.ufCartorio).toBe('SP');
    expect(resultado.municipioCartorio).toBe('SÃO PAULO');
    expect(resultado.nomeCartorio).toBe('1º OFÍCIO DE REGISTRO CIVIL');
    expect(resultado.numeroTermo).toBe('9000');
    expect(resultado.dataEmissaoCertidao).toBe('17/08/2005');
    expect(resultado.estadoCertidao).toBe('SP');
    expect(resultado.folhaCertidao).toBe('45');
    expect(resultado.livroCertidao).toBe('0012');
  });
});


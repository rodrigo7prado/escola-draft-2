/**
 * Detecta o tipo de página a partir do texto colado
 *
 * @param texto - Texto colado pelo usuário
 * @returns 'dadosPessoais' | 'dadosEscolares' | null (não reconhecido)
 * @throws Error se texto contém marcadores de ambos os tipos (ambíguo)
 *
 * CORREÇÃO: Usa sistema de marcadores FORTES e FRACOS para evitar falsos positivos
 * Bug anterior: /\bNOTA\b/ detectava "NOTA" em "NascimENTO"
 */

export type TipoPagina = 'dadosPessoais' | 'dadosEscolares' | null;

export function detectarTipoPagina(texto: string): TipoPagina {
  if (!texto || texto.trim().length === 0) {
    return null;
  }

  // ===== MARCADORES FORTES: Alta confiança, específicos =====

  // Marcadores FORTES de Dados Pessoais
  const marcadoresFortesDadosPessoais = [
    /NOME COMPLETO:/i,
    /MATRÍCULA:/i,
    /DATA\s+DE\s+NASCIMENTO:/i,  // Aceita espaços variáveis
    /NOME\s+DA\s+MÃE:/i,
    /CPF:\s*\d/i,  // CPF seguido de dígitos
  ];

  // Marcadores FORTES de Dados Escolares
  const marcadoresFortesDadosEscolares = [
    /COMPONENTE CURRICULAR/i,
    /\b(DISCIPLINA|MATÉRIA)\s*:/i,  // Disciplina: ou Matéria:
    /\bBIMESTRE\s*\d/i,  // Bimestre seguido de número
    /\b(FREQUÊNCIA|PRESENÇA)\s*:/i,  // Frequência: (completo)
    /RESULTADO\s*:/i,  // Resultado: (com dois pontos)
  ];

  // ===== MARCADORES FRACOS: Menor confiança, contextuais =====

  // Marcadores FRACOS de Dados Escolares (apenas se não houver conflito)
  const marcadoresFracosDadosEscolares = [
    /\bNOTA\s*[:/]/i,  // "Nota:" ou "Nota /" (específico, não genérico)
    /NOTA\s+(FINAL|BIMESTRAL|DO\s+ALUNO)/i,  // "Nota Final", "Nota Bimestral"
  ];

  // Verificar marcadores FORTES primeiro
  const ehDadosPessoaisForte = marcadoresFortesDadosPessoais.some((regex) => regex.test(texto));
  const ehDadosEscolaresForte = marcadoresFortesDadosEscolares.some((regex) => regex.test(texto));

  // Se ambos os marcadores FORTES aparecem, há ambiguidade real
  if (ehDadosPessoaisForte && ehDadosEscolaresForte) {
    throw new Error('Texto contém múltiplos formatos. Cole apenas dados pessoais OU dados escolares por vez.');
  }

  // Se marcador FORTE de dados pessoais, retornar
  if (ehDadosPessoaisForte) return 'dadosPessoais';

  // Se marcador FORTE de dados escolares, retornar
  if (ehDadosEscolaresForte) return 'dadosEscolares';

  // Apenas se não houver marcadores fortes, testar marcadores fracos
  const ehDadosEscolaresfraco = marcadoresFracosDadosEscolares.some((regex) => regex.test(texto));
  if (ehDadosEscolaresfraco) return 'dadosEscolares';

  return null; // Formato não reconhecido
}

/**
 * Detecta o tipo de página a partir do texto colado
 *
 * @param texto - Texto colado pelo usuário
 * @returns 'dadosPessoais' | 'dadosEscolares' | null (não reconhecido)
 * @throws Error se texto contém marcadores de ambos os tipos (ambíguo)
 */

export type TipoPagina = 'dadosPessoais' | 'dadosEscolares' | null;

export function detectarTipoPagina(texto: string): TipoPagina {
  if (!texto || texto.trim().length === 0) {
    return null;
  }

  // Marcadores que identificam Dados Pessoais
  const marcadoresDadosPessoais = [
    /NOME COMPLETO:/i,
    /MATRÍCULA:/i,
    /DATA DE NASCIMENTO:/i,
  ];

  // Marcadores que identificam Dados Escolares
  const marcadoresDadosEscolares = [
    /COMPONENTE CURRICULAR/i,
    /\bNOTA\b/i,
    /\bFREQ/i,
    /RESULTADO/i,
  ];

  // Verificar se contém marcadores de Dados Pessoais
  const ehDadosPessoais = marcadoresDadosPessoais.some((regex) => regex.test(texto));

  // Verificar se contém marcadores de Dados Escolares
  const ehDadosEscolares = marcadoresDadosEscolares.some((regex) => regex.test(texto));

  // Ambíguo: contém marcadores de ambos os tipos
  if (ehDadosPessoais && ehDadosEscolares) {
    throw new Error('Texto contém múltiplos formatos. Cole apenas dados pessoais OU dados escolares por vez.');
  }

  if (ehDadosPessoais) return 'dadosPessoais';
  if (ehDadosEscolares) return 'dadosEscolares';

  return null; // Formato não reconhecido
}

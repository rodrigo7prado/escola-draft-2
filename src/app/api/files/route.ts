import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

// Helper para calcular hash dos dados
async function hashData(data: ParsedCsv): Promise<string> {
  const sortedRows = [...data.rows].sort((a, b) => {
    const keyA = Object.keys(a).map(k => `${k}:${a[k]}`).join('|');
    const keyB = Object.keys(b).map(k => `${k}:${b[k]}`).join('|');
    return keyA.localeCompare(keyB);
  });
  const str = JSON.stringify({ headers: data.headers.sort(), rows: sortedRows });
  return crypto.createHash('sha256').update(str).digest('hex');
}

// POST /api/files - Upload de arquivo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, fileName } = body as { data: ParsedCsv; fileName: string };

    if (!data || !fileName) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Calcular hash
    const dataHash = await hashData(data);

    // Verificar se já existe
    const existing = await prisma.arquivoImportado.findUnique({
      where: { hashArquivo: dataHash }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Arquivo com conteúdo idêntico já existe', fileId: existing.id },
        { status: 409 }
      );
    }

    // Criar arquivo importado
    const arquivo = await prisma.arquivoImportado.create({
      data: {
        nomeArquivo: fileName,
        hashArquivo: dataHash,
        tipo: 'alunos',
        status: 'ativo'
      }
    });

    // Criar linhas importadas e processar alunos
    const alunosMap = new Map<string, any>();

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];
      const matricula = row.ALUNO?.trim();

      if (!matricula) continue;

      // Criar linha importada
      const linha = await prisma.linhaImportada.create({
        data: {
          arquivoId: arquivo.id,
          numeroLinha: i,
          dadosOriginais: row as any,
          identificadorChave: matricula,
          tipoEntidade: 'aluno'
        }
      });

      // Guardar para processar alunos depois
      if (!alunosMap.has(matricula)) {
        alunosMap.set(matricula, {
          linha,
          dados: row
        });
      }
    }

    // Criar ou atualizar alunos e suas enturmações
    let alunosNovos = 0;
    let alunosAtualizados = 0;
    let enturmacoesNovas = 0;

    for (const [matricula, info] of alunosMap) {
      const alunoExistente = await prisma.aluno.findUnique({
        where: { matricula }
      });

      let alunoId: string;

      if (!alunoExistente) {
        const novoAluno = await prisma.aluno.create({
          data: {
            matricula,
            nome: info.dados.NOME_COMPL || null,
            origemTipo: 'csv',
            linhaOrigemId: info.linha.id
          }
        });
        alunosNovos++;
        alunoId = novoAluno.id;
      } else {
        // Atualiza linha de origem se for mais recente
        await prisma.aluno.update({
          where: { matricula },
          data: { linhaOrigemId: info.linha.id }
        });
        alunosAtualizados++;
        alunoId = alunoExistente.id;
      }

      // Função helper para remover prefixos
      const limparValor = (valor: string | undefined, prefixo: string): string => {
        if (!valor) return '';
        const str = valor.toString().trim();
        if (str.startsWith(prefixo)) {
          return str.substring(prefixo.length).trim();
        }
        return str;
      };

      // Criar registro de enturmação (se não existir)
      const anoLetivo = limparValor(info.dados.Ano, 'Ano Letivo:') || limparValor(info.dados.Ano, 'Ano:');
      const modalidade = limparValor(info.dados.MODALIDADE, 'Modalidade:');
      const turma = limparValor(info.dados.TURMA, 'Turma:');
      const serie = limparValor(info.dados.SERIE, 'Série:');
      const turno = limparValor(info.dados.TURNO, 'Turno:') || null;

      if (anoLetivo && modalidade && turma && serie) {
        // Verificar se já existe essa enturmação
        const enturmacaoExistente = await prisma.enturmacao.findFirst({
          where: {
            alunoId,
            anoLetivo,
            modalidade,
            turma,
            serie
          }
        });

        if (!enturmacaoExistente) {
          await prisma.enturmacao.create({
            data: {
              alunoId,
              anoLetivo,
              regime: 0, // Por padrão anual
              modalidade,
              turma,
              serie,
              turno,
              origemTipo: 'csv',
              linhaOrigemId: info.linha.id
            }
          });
          enturmacoesNovas++;
        }
      }
    }

    return NextResponse.json({
      arquivo,
      linhasImportadas: data.rows.length,
      alunosNovos,
      alunosAtualizados,
      enturmacoesNovas
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo' },
      { status: 500 }
    );
  }
}

// GET /api/files - Listar arquivos importados
export async function GET() {
  try {
    const arquivos = await prisma.arquivoImportado.findMany({
      where: { status: 'ativo' },
      orderBy: { dataUpload: 'desc' },
      include: {
        linhas: {
          select: {
            dadosOriginais: true
          }
        },
        _count: {
          select: { linhas: true }
        }
      }
    });

    // Adicionar metadados extraídos das linhas
    const arquivosComMetadados = arquivos.map(arquivo => {
      const anosSet = new Set<string>();
      const modalidadesSet = new Set<string>();
      const turmasSet = new Set<string>();

      for (const linha of arquivo.linhas) {
        const dados = linha.dadosOriginais as any;
        if (dados.Ano) anosSet.add(dados.Ano);
        if (dados.MODALIDADE) modalidadesSet.add(dados.MODALIDADE);
        if (dados.TURMA) turmasSet.add(dados.TURMA);
      }

      return {
        id: arquivo.id,
        nomeArquivo: arquivo.nomeArquivo,
        dataUpload: arquivo.dataUpload,
        hashArquivo: arquivo.hashArquivo,
        anos: Array.from(anosSet),
        modalidades: Array.from(modalidadesSet),
        turmas: Array.from(turmasSet),
        _count: arquivo._count
      };
    });

    return NextResponse.json({ arquivos: arquivosComMetadados });

  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar arquivos' },
      { status: 500 }
    );
  }
}

// DELETE /api/files - Marcar arquivo como excluído
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Parâmetro id é obrigatório' },
        { status: 400 }
      );
    }

    // Marcar como excluído (não deleta fisicamente)
    await prisma.arquivoImportado.update({
      where: { id },
      data: {
        status: 'excluido',
        excluidoEm: new Date()
      }
    });

    // O trigger fn_marcar_fonte_ausente vai marcar alunos como fonteAusente=true

    return NextResponse.json({ message: 'Arquivo marcado como excluído' });

  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir arquivo' },
      { status: 500 }
    );
  }
}

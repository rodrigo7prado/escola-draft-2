import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { limparValor } from '@/lib/csv';
import { hashData, type ParsedCsv } from '@/lib/hash';

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

    // Verificar se já existe (apenas entre arquivos ATIVOS)
    const existing = await prisma.arquivoImportado.findFirst({
      where: {
        hashArquivo: dataHash,
        status: 'ativo'
      }
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

    // Função limparValor() agora importada de @/lib/csv

    // Criar linhas importadas e agrupar por aluno+enturmação
    type ChaveEnturmacao = string; // `${matricula}|${anoLetivo}|${turma}`
    const enturmacoesMap = new Map<ChaveEnturmacao, any>();

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

      // Extrair dados de enturmação DESTA linha
      const anoLetivo = limparValor(row.Ano, 'Ano Letivo:') || limparValor(row.Ano, 'Ano:');
      const turma = limparValor(row.TURMA, 'Turma:');

      // Criar chave única: matrícula + ano + turma
      const chave: ChaveEnturmacao = `${matricula}|${anoLetivo}|${turma}`;

      // Guardar APENAS se for a primeira linha dessa combinação
      if (!enturmacoesMap.has(chave)) {
        enturmacoesMap.set(chave, {
          matricula,
          linha,
          dados: row
        });
      }
    }

    // Criar ou atualizar alunos e suas enturmações
    let alunosNovos = 0;
    let alunosAtualizados = 0;
    let enturmacoesNovas = 0;

    // Agrupar alunos únicos primeiro (para criar apenas uma vez)
    const alunosUnicos = new Map<string, any>();
    for (const [, info] of enturmacoesMap) {
      const matricula = info.matricula;
      if (!alunosUnicos.has(matricula)) {
        alunosUnicos.set(matricula, info);
      }
    }

    // Criar/atualizar alunos
    const alunosIds = new Map<string, string>();

    for (const [matricula, info] of alunosUnicos) {
      let alunoId: string;

      try {
        const alunoExistente = await prisma.aluno.findUnique({
          where: { matricula }
        });

        if (!alunoExistente) {
          const novoAluno = await prisma.aluno.create({
            data: {
              matricula,
              nome: info.dados.NOME_COMPL || null,
              origemTipo: 'csv',
              linhaOrigemId: info.linha.id,
              fonteAusente: false
            }
          });
          alunosNovos++;
          alunoId = novoAluno.id;
        } else {
          // Atualizar aluno existente: resetar fonteAusente se estava true
          if (alunoExistente.fonteAusente) {
            await prisma.aluno.update({
              where: { id: alunoExistente.id },
              data: {
                linhaOrigemId: info.linha.id,
                fonteAusente: false
              }
            });
          }
          alunoId = alunoExistente.id;
          alunosAtualizados++;
        }

        alunosIds.set(matricula, alunoId);
      } catch (error: any) {
        // Race condition: outro processo criou o aluno entre o findUnique e o create
        // Tentar buscar novamente
        if (error.code === 'P2002') {
          console.warn(`[POST /api/files] Race condition detectada para matrícula ${matricula}, tentando buscar novamente...`);
          const alunoExistente = await prisma.aluno.findUnique({
            where: { matricula }
          });

          if (alunoExistente) {
            alunoId = alunoExistente.id;
            alunosIds.set(matricula, alunoId);
            alunosAtualizados++;
          } else {
            console.error(`[POST /api/files] ERRO: Aluno ${matricula} não encontrado após race condition`);
            throw error;
          }
        } else {
          // Erro não relacionado a race condition, propagar
          throw error;
        }
      }
    }

    // Agora criar enturmações (uma por chave única)
    for (const [, info] of enturmacoesMap) {
      const alunoId = alunosIds.get(info.matricula);
      if (!alunoId) continue;

      // Extrair dados de enturmação
      const anoLetivo = limparValor(info.dados.Ano, 'Ano Letivo:') || limparValor(info.dados.Ano, 'Ano:');
      const modalidade = limparValor(info.dados.MODALIDADE, 'Modalidade:');
      const turma = limparValor(info.dados.TURMA, 'Turma:');
      const serie = limparValor(info.dados.SERIE, 'Série:');
      const turno = limparValor(info.dados.TURNO, 'Turno:') || null;

      if (anoLetivo && modalidade && turma && serie) {
        try {
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
                linhaOrigemId: info.linha.id,
                fonteAusente: false
              }
            });
            enturmacoesNovas++;
          } else if (enturmacaoExistente.fonteAusente) {
            // Resetar fonteAusente se estava true
            await prisma.enturmacao.update({
              where: { id: enturmacaoExistente.id },
              data: {
                linhaOrigemId: info.linha.id,
                fonteAusente: false
              }
            });
          }
        } catch (error: any) {
          // Race condition em enturmação: outro processo criou entre findFirst e create
          if (error.code === 'P2002') {
            console.warn(`[POST /api/files] Race condition detectada em enturmação para aluno ${info.matricula}, ignorando...`);
            // Enturmação já existe, não precisa fazer nada
          } else {
            // Erro não relacionado a race condition, propagar
            throw error;
          }
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

// GET /api/files - Listar dados por hierarquia (Período → Turma → Alunos)
export async function GET() {
  try {
    // Buscar todas as linhas importadas de arquivos ativos
    const linhasImportadas = await prisma.linhaImportada.findMany({
      where: {
        tipoEntidade: 'aluno',
        arquivo: {
          status: 'ativo'
        }
      },
      select: {
        identificadorChave: true,
        dadosOriginais: true
      }
    });

    // Agrupar por período letivo e turma
    type AlunoCsv = {
      matricula: string;
      nome: string;
    };

    type TurmaData = {
      nome: string;
      alunosCSV: Map<string, AlunoCsv>;
    };

    type PeriodoData = {
      anoLetivo: string;
      turmas: Map<string, TurmaData>;
    };

    const periodosMap = new Map<string, PeriodoData>();

    // Processar linhas do CSV
    for (const linha of linhasImportadas) {
      const dados = linha.dadosOriginais as any;
      const matricula = linha.identificadorChave;

      if (!matricula) continue;

      // IMPORTANTE: Usar limparValor() para consistência com POST
      const anoLetivo = limparValor(dados.Ano, 'Ano Letivo:') ||
                        limparValor(dados.Ano, 'Ano:') ||
                        '(sem ano)';
      const turma = limparValor(dados.TURMA, 'Turma:') || '(sem turma)';
      const nome = dados.NOME_COMPL || dados.NOME || '(sem nome)';

      // Criar estrutura de período se não existir
      if (!periodosMap.has(anoLetivo)) {
        periodosMap.set(anoLetivo, {
          anoLetivo,
          turmas: new Map()
        });
      }

      const periodo = periodosMap.get(anoLetivo)!;

      // Criar estrutura de turma se não existir
      if (!periodo.turmas.has(turma)) {
        periodo.turmas.set(turma, {
          nome: turma,
          alunosCSV: new Map()
        });
      }

      const turmaData = periodo.turmas.get(turma)!;

      // Adicionar aluno ao CSV (deduplica por matrícula)
      turmaData.alunosCSV.set(matricula, { matricula, nome });
    }

    // Buscar alunos criados no banco agrupados por enturmação
    const enturmacoes = await prisma.enturmacao.findMany({
      select: {
        anoLetivo: true,
        turma: true,
        aluno: {
          select: {
            matricula: true,
            nome: true
          }
        }
      }
    });

    // Mapear alunos no banco por período e turma
    type AlunosNoBanco = Map<string, Set<string>>; // Map<turma, Set<matricula>>
    const alunosBancoMap = new Map<string, AlunosNoBanco>();

    for (const ent of enturmacoes) {
      if (!alunosBancoMap.has(ent.anoLetivo)) {
        alunosBancoMap.set(ent.anoLetivo, new Map());
      }

      const turmasMap = alunosBancoMap.get(ent.anoLetivo)!;

      if (!turmasMap.has(ent.turma)) {
        turmasMap.set(ent.turma, new Set());
      }

      turmasMap.get(ent.turma)!.add(ent.aluno.matricula);
    }

    // Montar resposta final
    const periodos = Array.from(periodosMap.values()).map(periodo => {
      const turmas = Array.from(periodo.turmas.values()).map(turmaData => {
        const alunosCSV = Array.from(turmaData.alunosCSV.values());
        const totalAlunosCSV = alunosCSV.length;

        // Buscar alunos desta turma no banco
        const alunosNoBancoSet = alunosBancoMap.get(periodo.anoLetivo)?.get(turmaData.nome) || new Set();
        const totalAlunosBanco = alunosNoBancoSet.size;

        // Identificar pendentes (no CSV mas não no banco)
        const alunosPendentes = alunosCSV.filter(
          aluno => !alunosNoBancoSet.has(aluno.matricula)
        );

        const pendentes = alunosPendentes.length;
        const status = pendentes > 0 ? 'pendente' : 'ok';

        return {
          nome: turmaData.nome,
          totalAlunosCSV,
          totalAlunosBanco,
          pendentes,
          status,
          alunosPendentes: status === 'pendente' ? alunosPendentes : undefined
        };
      }).sort((a, b) => {
        // Ordenar turmas por nome (numérico se possível)
        return a.nome.localeCompare(b.nome, undefined, { numeric: true });
      });

      // Calcular resumo do período
      const totalTurmas = turmas.length;
      const totalAlunosCSV = turmas.reduce((sum, t) => sum + t.totalAlunosCSV, 0);
      const totalAlunosBanco = turmas.reduce((sum, t) => sum + t.totalAlunosBanco, 0);
      const pendentes = turmas.reduce((sum, t) => sum + t.pendentes, 0);
      const status = pendentes > 0 ? 'pendente' : 'ok';

      return {
        anoLetivo: periodo.anoLetivo,
        resumo: {
          totalTurmas,
          totalAlunosCSV,
          totalAlunosBanco,
          pendentes,
          status
        },
        turmas
      };
    }).sort((a, b) => {
      // Ordenar períodos por ano (decrescente)
      return b.anoLetivo.localeCompare(a.anoLetivo);
    });

    return NextResponse.json({ periodos });

  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar arquivos' },
      { status: 500 }
    );
  }
}

// DELETE /api/files - Hard delete de arquivo(s) e marcar entidades como fonteAusente
// Suporta: ?id=X (individual) ou ?periodo=2024 (todos do período)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const periodo = searchParams.get('periodo');

    if (!id && !periodo) {
      return NextResponse.json(
        { error: 'Parâmetro id ou periodo é obrigatório' },
        { status: 400 }
      );
    }

    if (id) {
      // Deletar arquivo individual
      // 1. Buscar IDs das LinhaImportada deste arquivo
      const linhasIds = await prisma.linhaImportada.findMany({
        where: { arquivoId: id },
        select: { id: true }
      });

      const linhasIdsArray = linhasIds.map(l => l.id);

      // 2. Marcar alunos e enturmações como fonteAusente
      await prisma.$transaction([
        // Alunos que vieram deste arquivo
        prisma.aluno.updateMany({
          where: {
            linhaOrigemId: { in: linhasIdsArray },
            origemTipo: 'csv'
          },
          data: { fonteAusente: true }
        }),
        // Enturmações que vieram deste arquivo
        prisma.enturmacao.updateMany({
          where: {
            linhaOrigemId: { in: linhasIdsArray },
            origemTipo: 'csv'
          },
          data: { fonteAusente: true }
        })
      ]);

      // 3. Hard delete do arquivo (cascade deleta LinhaImportada)
      await prisma.arquivoImportado.delete({
        where: { id }
      });

      return NextResponse.json({
        message: 'Arquivo deletado e entidades marcadas como fonte ausente',
        alunosMarcados: linhasIdsArray.length // aproximado
      });
    }

    if (periodo) {
      // Deletar todos os arquivos do período letivo
      // 1. Buscar linhas com este período
      const linhas = await prisma.linhaImportada.findMany({
        where: {
          tipoEntidade: 'aluno',
          arquivo: {
            status: 'ativo'
          }
        },
        select: {
          id: true,
          arquivoId: true,
          dadosOriginais: true
        }
      });

      // 2. Filtrar linhas do período e coletar IDs
      const arquivosIds = new Set<string>();
      const linhasIdsDoPeriodo: string[] = [];

      for (const linha of linhas) {
        const dados = linha.dadosOriginais as any;
        const anoLetivo = limparValor(dados.Ano, 'Ano Letivo:') ||
                          limparValor(dados.Ano, 'Ano:');

        if (anoLetivo === periodo) {
          arquivosIds.add(linha.arquivoId);
          linhasIdsDoPeriodo.push(linha.id);
        }
      }

      if (arquivosIds.size === 0) {
        return NextResponse.json({
          message: `Nenhum arquivo do período ${periodo} encontrado`
        });
      }

      // 3. Marcar alunos e enturmações como fonteAusente
      await prisma.$transaction([
        // Alunos
        prisma.aluno.updateMany({
          where: {
            linhaOrigemId: { in: linhasIdsDoPeriodo },
            origemTipo: 'csv'
          },
          data: { fonteAusente: true }
        }),
        // Enturmações
        prisma.enturmacao.updateMany({
          where: {
            linhaOrigemId: { in: linhasIdsDoPeriodo },
            origemTipo: 'csv'
          },
          data: { fonteAusente: true }
        })
      ]);

      // 4. Hard delete dos arquivos (cascade deleta LinhaImportada)
      await prisma.arquivoImportado.deleteMany({
        where: {
          id: { in: Array.from(arquivosIds) }
        }
      });

      return NextResponse.json({
        message: `${arquivosIds.size} arquivo(s) do período ${periodo} deletado(s) e entidades marcadas como fonte ausente`,
        arquivosDeletados: arquivosIds.size,
        linhasDeletadas: linhasIdsDoPeriodo.length
      });
    }

  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir arquivo' },
      { status: 500 }
    );
  }
}

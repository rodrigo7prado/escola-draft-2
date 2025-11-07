/**
 * Testes de integração para GET /api/files
 *
 * BUG CRÍTICO V5.3.3: Sempre retorna arrays vazios para alunosPendentes
 * Objetivo: Diagnosticar e corrigir o problema
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  setupTestDatabase,
  clearTestDatabase,
  teardownTestDatabase,
  getTestPrisma,
} from '../../helpers/db-setup';

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await clearTestDatabase();
});

describe('GET /api/files - Visualização hierárquica', () => {
  it('BUG V5.3.3: deve identificar alunos pendentes corretamente', async () => {
    const prisma = getTestPrisma();

    // 1. Criar arquivo com 3 alunos no CSV
    const arquivo = await prisma.arquivoImportado.create({
      data: {
        nomeArquivo: 'teste.csv',
        hashArquivo: 'hash-teste-123',
        tipo: 'alunos',
        status: 'ativo',
      },
    });

    // 2. Criar 3 linhas importadas (representam 3 alunos)
    await prisma.linhaImportada.createMany({
      data: [
        {
          arquivoId: arquivo.id,
          numeroLinha: 0,
          dadosOriginais: {
            ALUNO: '111111111111111',
            NOME_COMPL: 'Aluno 1',
            Ano: 'Ano Letivo: 2024',
            TURMA: 'Turma: 3001',
          },
          identificadorChave: '111111111111111',
          tipoEntidade: 'aluno',
        },
        {
          arquivoId: arquivo.id,
          numeroLinha: 1,
          dadosOriginais: {
            ALUNO: '222222222222222',
            NOME_COMPL: 'Aluno 2',
            Ano: 'Ano Letivo: 2024',
            TURMA: 'Turma: 3001',
          },
          identificadorChave: '222222222222222',
          tipoEntidade: 'aluno',
        },
        {
          arquivoId: arquivo.id,
          numeroLinha: 2,
          dadosOriginais: {
            ALUNO: '333333333333333',
            NOME_COMPL: 'Aluno 3',
            Ano: 'Ano Letivo: 2024',
            TURMA: 'Turma: 3001',
          },
          identificadorChave: '333333333333333',
          tipoEntidade: 'aluno',
        },
      ],
    });

    // 3. Criar APENAS 1 aluno no banco (os outros 2 ficam pendentes)
    const linhas = await prisma.linhaImportada.findMany();
    const aluno1 = await prisma.aluno.create({
      data: {
        matricula: '111111111111111',
        nome: 'Aluno 1',
        origemTipo: 'csv',
        linhaOrigemId: linhas[0].id,
        fonteAusente: false,
      },
    });

    // 4. Criar enturmação para o aluno criado
    await prisma.enturmacao.create({
      data: {
        alunoId: aluno1.id,
        anoLetivo: '2024',
        regime: 0,
        modalidade: 'REGULAR',
        turma: '3001',
        serie: '3',
        turno: 'MANHÃ',
        origemTipo: 'csv',
        linhaOrigemId: linhas[0].id,
        fonteAusente: false,
      },
    });

    // 5. Simular lógica do GET /api/files (copiar código de route.ts)
    const linhasImportadas = await prisma.linhaImportada.findMany({
      where: {
        tipoEntidade: 'aluno',
        arquivo: {
          status: 'ativo',
        },
      },
      select: {
        identificadorChave: true,
        dadosOriginais: true,
      },
    });

    // Processar como na API
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

    for (const linha of linhasImportadas) {
      const dados = linha.dadosOriginais as any;
      const matricula = linha.identificadorChave;

      if (!matricula) continue;

      const anoLetivo = dados.Ano?.replace('Ano Letivo: ', '').trim() || '(sem ano)';
      const turma = dados.TURMA?.replace('Turma: ', '').trim() || '(sem turma)';
      const nome = dados.NOME_COMPL || '(sem nome)';

      if (!periodosMap.has(anoLetivo)) {
        periodosMap.set(anoLetivo, {
          anoLetivo,
          turmas: new Map(),
        });
      }

      const periodo = periodosMap.get(anoLetivo)!;

      if (!periodo.turmas.has(turma)) {
        periodo.turmas.set(turma, {
          nome: turma,
          alunosCSV: new Map(),
        });
      }

      const turmaData = periodo.turmas.get(turma)!;
      turmaData.alunosCSV.set(matricula, { matricula, nome });
    }

    console.log(`Períodos criados: ${periodosMap.size}`);
    const periodo2024 = periodosMap.get('2024');
    console.log(`Turmas em 2024: ${periodo2024?.turmas.size}`);
    const turma3001 = periodo2024?.turmas.get('3001');
    console.log(`Alunos CSV em 3001: ${turma3001?.alunosCSV.size}`);

    // Buscar alunos no banco
    const enturmacoes = await prisma.enturmacao.findMany({
      select: {
        anoLetivo: true,
        turma: true,
        aluno: {
          select: {
            matricula: true,
            nome: true,
          },
        },
      },
    });

    console.log(`Enturmações no banco: ${enturmacoes.length}`);

    type AlunosNoBanco = Map<string, Set<string>>;
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

    console.log(`Anos no banco: ${alunosBancoMap.size}`);
    const turmasBanco2024 = alunosBancoMap.get('2024');
    console.log(`Turmas no banco 2024: ${turmasBanco2024?.size}`);
    const alunosBanco3001 = turmasBanco2024?.get('3001');
    console.log(`Alunos no banco 3001: ${alunosBanco3001?.size}`);
    console.log(`Matrículas no banco: ${Array.from(alunosBanco3001 || [])}`);

    // Calcular pendentes
    const alunosCSV = Array.from(turma3001?.alunosCSV.values() || []);
    const alunosNoBancoSet = alunosBanco3001 || new Set();

    console.log('Alunos CSV:', alunosCSV.map(a => a.matricula));
    console.log('Alunos no banco (Set):', Array.from(alunosNoBancoSet));

    const alunosPendentes = alunosCSV.filter(
      aluno => !alunosNoBancoSet.has(aluno.matricula)
    );

    console.log(`Pendentes: ${alunosPendentes.length}`);
    console.log('Lista pendentes:', alunosPendentes);

    // VALIDAÇÕES
    expect(linhasImportadas).toHaveLength(3);
    expect(periodosMap.size).toBe(1); // 1 período (2024)
    expect(turma3001?.alunosCSV.size).toBe(3); // 3 alunos no CSV
    expect(enturmacoes).toHaveLength(1); // 1 enturmação criada
    expect(alunosNoBancoSet.size).toBe(1); // 1 aluno no banco
    expect(alunosPendentes).toHaveLength(2); // 2 pendentes
    expect(alunosPendentes[0].matricula).toBe('222222222222222');
    expect(alunosPendentes[1].matricula).toBe('333333333333333');
  });
});

"use client";

import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { Checkbox } from '@/components/ui/Checkbox';
import { Textarea } from '@/components/ui/Textarea';

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

type DadosAlunoEditavelProps = {
  aluno: Aluno | null;
};

export function DadosAlunoEditavel({ aluno }: DadosAlunoEditavelProps) {
  if (!aluno) {
    return (
      <div className="text-center py-12 text-neutral-500 text-sm">
        Selecione um aluno na lista ao lado
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto h-full p-4">
      {/* Avisos */}
      {aluno.fonteAusente && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
          ⚠️ Arquivo de origem foi excluído
        </div>
      )}

      {/* Identificação */}
      <section>
        <h3 className="text-xs font-semibold text-neutral-700 mb-2 pb-1 border-b">Identificação</h3>
        <div className="grid grid-cols-3 gap-2">
          <FormField label="Matrícula">
            <Input value={aluno.matricula} readOnly />
          </FormField>
          <FormField label="Nome Completo" className="col-span-2">
            <Input value={aluno.nome || ''} readOnly />
          </FormField>
          <FormField label="Sexo">
            <Input value={aluno.sexo || ''} readOnly />
          </FormField>
          <FormField label="Data de Nascimento" className="col-span-2">
            <DateInput value={aluno.dataNascimento} readOnly />
          </FormField>
        </div>
      </section>

      {/* Documentos */}
      <section>
        <h3 className="text-xs font-semibold text-neutral-700 mb-2 pb-1 border-b">Documentos</h3>
        <div className="grid grid-cols-3 gap-2">
          <FormField label="RG">
            <Input value={aluno.rg || ''} readOnly />
          </FormField>
          <FormField label="Órgão Emissor">
            <Input value={aluno.rgOrgaoEmissor || ''} readOnly />
          </FormField>
          <FormField label="Data Emissão">
            <DateInput value={aluno.rgDataEmissao} readOnly />
          </FormField>
          <FormField label="CPF" className="col-span-3">
            <Input value={aluno.cpf || ''} readOnly />
          </FormField>
        </div>
      </section>

      {/* Naturalidade */}
      <section>
        <h3 className="text-xs font-semibold text-neutral-700 mb-2 pb-1 border-b">Naturalidade</h3>
        <div className="grid grid-cols-3 gap-2">
          <FormField label="Nacionalidade">
            <Input value={aluno.nacionalidade || ''} readOnly />
          </FormField>
          <FormField label="Naturalidade">
            <Input value={aluno.naturalidade || ''} readOnly />
          </FormField>
          <FormField label="UF">
            <Input value={aluno.uf || ''} readOnly />
          </FormField>
        </div>
      </section>

      {/* Filiação */}
      <section>
        <h3 className="text-xs font-semibold text-neutral-700 mb-2 pb-1 border-b">Filiação</h3>
        <div className="grid grid-cols-1 gap-2">
          <FormField label="Nome da Mãe">
            <Input value={aluno.nomeMae || ''} readOnly />
          </FormField>
          <FormField label="Nome do Pai">
            <Input value={aluno.nomePai || ''} readOnly />
          </FormField>
        </div>
      </section>

      {/* Escolaridade */}
      <section>
        <h3 className="text-xs font-semibold text-neutral-700 mb-2 pb-1 border-b">Ensino Médio</h3>
        <div className="space-y-2">
          <FormField label="Data de Conclusão">
            <DateInput value={aluno.dataConclusaoEnsinoMedio} readOnly />
          </FormField>
          <div className="flex gap-4">
            <Checkbox label="Certificação" checked={aluno.certificacao} readOnly />
            <Checkbox label="Dados Conferidos" checked={aluno.dadosConferidos} readOnly />
          </div>
        </div>
      </section>

      {/* Ensino Fundamental */}
      <section>
        <h3 className="text-xs font-semibold text-neutral-700 mb-2 pb-1 border-b">Ensino Fundamental</h3>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Instituição de Ensino" className="col-span-2">
            <Input value={aluno.efInstituicao || ''} readOnly />
          </FormField>
          <FormField label="Município/Estado">
            <Input value={aluno.efMunicipioEstado || ''} readOnly />
          </FormField>
          <FormField label="Ano de Conclusão">
            <Input type="number" value={aluno.efAnoConclusao || ''} readOnly />
          </FormField>
          <FormField label="Número da Página">
            <Input value={aluno.efNumeroPagina || ''} readOnly />
          </FormField>
          <FormField label="Data de Emissão">
            <DateInput value={aluno.efDataEmissao} readOnly />
          </FormField>
        </div>
      </section>

      {/* Observações */}
      <section>
        <h3 className="text-xs font-semibold text-neutral-700 mb-2 pb-1 border-b">Observações</h3>
        <FormField label="">
          <Textarea value={aluno.observacoes || ''} rows={3} readOnly />
        </FormField>
      </section>
    </div>
  );
}

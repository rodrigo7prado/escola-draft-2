"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { Textarea } from "@/components/ui/Textarea";
import {
  CAMPOS_DADOS_PESSOAIS_CONFIG,
  CATEGORIA_LABELS,
  normalizarValorParaComparacao,
  type CampoDadosPessoais,
  type CategoriaDadosPessoais,
  type TipoInputCampo,
} from "@/lib/importacao/dadosPessoaisMetadata";
import { Select } from "@/components/ui/Select";
import type {
  AlunoDetalhado,
  DadosOriginaisAluno,
} from "@/hooks/useAlunoSelecionado";

type ValoresFormulario = Partial<Record<CampoDadosPessoais, string>>;

type DadosAlunoEditavelProps = {
  aluno: AlunoDetalhado | null;
  dadosOriginais: DadosOriginaisAluno;
  isLoading: boolean;
  erro?: string | null;
};

const ORDEM_CATEGORIAS: CategoriaDadosPessoais[] = [
  "cadastro",
  "documentos",
  "filiacao",
  "contato",
  "certidao",
];

export function DadosAlunoEditavel({
  aluno,
  dadosOriginais,
  isLoading,
  erro,
}: DadosAlunoEditavelProps) {
  const valoresBase = useMemo(
    () => extrairValoresDoAluno(aluno),
    [aluno?.id]
  );
  const [formState, setFormState] = useState<ValoresFormulario>(valoresBase);

  useEffect(() => {
    setFormState(valoresBase);
  }, [valoresBase]);

  const possuiAlteracoes = useMemo(() => {
    for (const campo of Object.keys(valoresBase) as CampoDadosPessoais[]) {
      if ((formState[campo] || "") !== (valoresBase[campo] || "")) {
        return true;
      }
    }
    return false;
  }, [formState, valoresBase]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-neutral-500">
        Carregando dados completos do aluno...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-600 text-center px-6">
        {erro}
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="text-center py-12 text-neutral-500 text-sm">
        Selecione um aluno na lista ao lado
      </div>
    );
  }

  const resetarAlteracoes = () => setFormState(valoresBase);

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {aluno.fonteAusente && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm px-3 py-2 text-xs text-yellow-800">
          ⚠️ Arquivo de origem foi excluído. Dados originais preservados apenas
          na importação estruturada.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <div>
          <div className="text-sm font-semibold text-neutral-800">
            Dados pessoais do aluno
          </div>
          <div className="text-xs text-neutral-500">
            Compare o valor atual (campo editável) com o valor original da
            importação.
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetarAlteracoes}
          disabled={!possuiAlteracoes}
        >
          Resetar alterações
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        {ORDEM_CATEGORIAS.map((categoria) => {
          const campos = CAMPOS_DADOS_PESSOAIS_CONFIG.filter(
            (config) => config.categoria === categoria
          );
          return (
            <section key={categoria} className="space-y-3">
              <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                {CATEGORIA_LABELS[categoria]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {campos.map((config) => (
                  <CampoComparado
                    key={config.campo}
                    config={config}
                    value={formState[config.campo] ?? ""}
                    valorBanco={aluno[config.campo] ?? null}
                    valorOriginal={
                      (dadosOriginais?.[config.campo] as string | undefined) ??
                      null
                    }
                    onChange={(novoValor) =>
                      setFormState((prev) => ({
                        ...prev,
                        [config.campo]: novoValor,
                      }))
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

type CampoComparadoProps = {
  config: (typeof CAMPOS_DADOS_PESSOAIS_CONFIG)[number];
  value: string;
  valorBanco: string | null;
  valorOriginal: string | null;
  onChange: (novoValor: string) => void;
};

function CampoComparado({
  config,
  value,
  valorBanco,
  valorOriginal,
  onChange,
}: CampoComparadoProps) {
  const status = obterStatusComparacao(config, valorBanco, valorOriginal);
  const InputComponent = escolherInput(config.input);
  const valorOriginalDisplay = formatarValorDisplay(valorOriginal, config.input);
  const mostrarBadge = status !== "igual";
  const mostrarOriginal =
    status === "diferente" && Boolean(valorOriginalDisplay);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-neutral-700">
          {config.label}
        </div>
        {mostrarBadge && <BadgeComparacao status={status} />}
      </div>
      <InputComponent
        value={value}
        onChangeValue={onChange}
        options={config.options}
      />
      {mostrarOriginal && (
        <div className="text-[10px] text-neutral-500">
          Original:{" "}
          <span className="font-medium text-neutral-700">
            {valorOriginalDisplay}
          </span>
        </div>
      )}
    </div>
  );
}

type StatusComparacao = "igual" | "diferente" | "ausente";

function obterStatusComparacao(
  config: (typeof CAMPOS_DADOS_PESSOAIS_CONFIG)[number],
  valorAtual: string | null,
  valorOriginal: string | null
): StatusComparacao {
  const atual = normalizarValorParaComparacao(config, valorAtual);
  const original = normalizarValorParaComparacao(config, valorOriginal);

  if (!atual && !original) {
    return "ausente";
  }

  if (!atual && original) {
    return "ausente";
  }

  if (atual && !original) {
    return "diferente";
  }

  return atual === original ? "igual" : "diferente";
}

function BadgeComparacao({ status }: { status: StatusComparacao }) {
  const map = {
    igual: {
      classe: "",
      texto: "",
    },
    diferente: {
      classe: "bg-green-100 text-green-800 border-green-200",
      texto: "Atualizado",
    },
    ausente: {
      classe: "bg-amber-100 text-amber-800 border-amber-200",
      texto: "Pendente",
    },
  } as const;

  const { classe, texto } = map[status];

  return (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border leading-none ${classe}`}
    >
      {texto}
    </span>
  );
}

function escolherInput(tipo: TipoInputCampo | undefined) {
  if (tipo === "date") {
    return DateInputWrapper;
  }
  if (tipo === "textarea") {
    return TextareaWrapper;
  }
  if (tipo === "select") {
    return SelectWrapper;
  }
  return InputWrapper;
}

type CampoInputProps = {
  value: string;
  onChangeValue: (valor: string) => void;
  options?: Array<{ value: string; label: string }>;
};

function InputWrapper({ value, onChangeValue }: CampoInputProps) {
  return (
    <Input value={value} onChange={(event) => onChangeValue(event.target.value)} />
  );
}

function DateInputWrapper({ value, onChangeValue }: CampoInputProps) {
  return (
    <DateInput
      value={value || ""}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChangeValue(event.target.value)
      }
    />
  );
}

function TextareaWrapper({ value, onChangeValue }: CampoInputProps) {
  return (
    <Textarea
      rows={2}
      value={value}
      onChange={(event) => onChangeValue(event.target.value)}
    />
  );
}

function SelectWrapper({ value, onChangeValue, options = [] }: CampoInputProps) {
  return (
    <Select
      value={value}
      onChange={(event) => onChangeValue(event.target.value)}
      options={options}
      className="text-xs"
    />
  );
}

function formatarValorDisplay(
  valor: string | null,
  tipo: TipoInputCampo | undefined
): string {
  if (!valor) return "";
  if (tipo === "date") {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) {
      return valor;
    }
    return data.toLocaleDateString("pt-BR");
  }
  return valor;
}

function extrairValoresDoAluno(aluno: AlunoDetalhado | null): ValoresFormulario {
  if (!aluno) return {};
  const resultado: ValoresFormulario = {};

  for (const config of CAMPOS_DADOS_PESSOAIS_CONFIG) {
    const valor = aluno[config.campo] ?? "";
    resultado[config.campo] =
      config.input === "date" ? normalizarDataParaInput(valor) : (valor || "");
  }

  return resultado;
}

function normalizarDataParaInput(valor: string | null): string {
  if (!valor) return "";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return valor;
  }
  return data.toISOString().split("T")[0];
}

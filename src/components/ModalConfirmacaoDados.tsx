"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import type { DadosPessoais } from "@/lib/parsing/parseDadosPessoais";

type ModalConfirmacaoDadosProps = {
  open: boolean;
  dados: DadosPessoais | null;
  precisaConfirmarSexo: boolean;
  isSalvando: boolean;
  onConfirmar: (dados: DadosPessoais, sexoConfirmado?: "M" | "F") => void;
  onCancelar: () => void;
};

/**
 * Componente auxiliar para exibir campo
 * (Declarado fora do componente principal para evitar recriação)
 */
const Campo = ({ label, valor }: { label: string; valor?: string }) => {
  const temValor = valor && valor.trim() !== "";

  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-xs">
      <div className="font-medium text-neutral-600">{label}:</div>
      <div
        className={temValor ? "text-neutral-900" : "text-neutral-400 italic"}
      >
        {temValor ? valor : "(não detectado)"}
      </div>
    </div>
  );
};

/**
 * Modal de confirmação de dados parseados
 *
 * Funcionalidades:
 * - Exibe todos os campos parseados organizados por seção
 * - Campo especial obrigatório: Sexo (se não detectado no parsing)
 * - Preview visual dos dados que serão salvos
 * - Botões: "Cancelar" e "Confirmar" (Enter para confirmar)
 */
export function ModalConfirmacaoDados({
  open,
  dados,
  precisaConfirmarSexo,
  isSalvando,
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoDadosProps) {
  const [sexoSelecionado, setSexoSelecionado] = useState<"M" | "F" | "">(
    () => dados?.sexo ?? ""
  );

  // Sincroniza sexo ao abrir modal (atualiza de forma assíncrona para evitar renderizações em cascata)
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      setSexoSelecionado(dados?.sexo ?? "");
    }, 0);
    return () => clearTimeout(id);
  }, [open, dados?.sexo]);

  if (!dados) return null;

  const handleConfirmar = () => {
    // Validar sexo se necessário
    if (precisaConfirmarSexo && !sexoSelecionado) {
      alert("Por favor, selecione o sexo do aluno");
      return;
    }

    onConfirmar(
      dados,
      precisaConfirmarSexo && sexoSelecionado ? sexoSelecionado : undefined
    );
  };

  // Handler para Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSalvando) {
      handleConfirmar();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onCancelar}
      title="Confirmar Dados Importados"
      size="lg"
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {/* Alerta de confirmação de sexo */}
        {precisaConfirmarSexo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3">
            <div className="text-sm font-semibold text-yellow-800 mb-2">
              ⚠️ Sexo não detectado automaticamente
            </div>
            <FormField label="Selecione o sexo do aluno" className="mb-0">
              <Select
                value={sexoSelecionado}
                onChange={(e) =>
                  setSexoSelecionado(e.target.value as "M" | "F")
                }
                options={[
                  { value: "", label: "Selecione..." },
                  { value: "M", label: "Masculino" },
                  { value: "F", label: "Feminino" },
                ]}
                required
              />
            </FormField>
          </div>
        )}

        {/* Seção 1: Dados Cadastrais */}
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2 pb-1 border-b">
            Dados Cadastrais
          </h3>
          <div className="space-y-1">
            <Campo label="Nome" valor={dados.nome} />
            <Campo label="Nome Social" valor={dados.nomeSocial} />
            <Campo label="Data de Nascimento" valor={dados.dataNascimento} />
            {!precisaConfirmarSexo && <Campo label="Sexo" valor={dados.sexo} />}
            <Campo label="Estado Civil" valor={dados.estadoCivil} />
            <Campo label="País de Nascimento" valor={dados.paisNascimento} />
            <Campo label="Nacionalidade" valor={dados.nacionalidade} />
            <Campo label="UF de Nascimento" valor={dados.uf} />
            <Campo label="Naturalidade" valor={dados.naturalidade} />
            <Campo
              label="Necessidade Especial"
              valor={dados.necessidadeEspecial}
            />
          </div>
        </section>

        {/* Seção 2: Documentos */}
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2 pb-1 border-b">
            Documentos
          </h3>
          <div className="space-y-1">
            <Campo label="Tipo de Documento" valor={dados.tipoDocumento} />
            <Campo label="RG" valor={dados.rg} />
            <Campo
              label="Complemento da Identidade"
              valor={dados.complementoIdentidade}
            />
            <Campo label="Estado (Emissão)" valor={dados.estadoEmissao} />
            <Campo label="Órgão Emissor" valor={dados.orgaoEmissor} />
            <Campo label="Data de Expedição" valor={dados.dataEmissaoRG} />
            <Campo label="CPF" valor={dados.cpf} />
          </div>
        </section>

        {/* Seção 3: Filiação */}
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2 pb-1 border-b">
            Filiação
          </h3>
          <div className="space-y-1">
            <Campo label="Nome da Mãe" valor={dados.nomeMae} />
            <Campo label="CPF da Mãe" valor={dados.cpfMae} />
            <Campo label="Nome do Pai" valor={dados.nomePai} />
            <Campo label="CPF do Pai" valor={dados.cpfPai} />
          </div>
        </section>

        {/* Seção 4: Contato */}
        {dados.email && (
          <section>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2 pb-1 border-b">
              Contato
            </h3>
            <div className="space-y-1">
              <Campo label="E-mail" valor={dados.email} />
            </div>
          </section>
        )}

        {/* Seção 5: Certidão Civil */}
        {(dados.tipoCertidaoCivil ||
          dados.numeroCertidaoCivil ||
          dados.ufCartorio ||
          dados.municipioCartorio ||
          dados.nomeCartorio) && (
          <section>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2 pb-1 border-b">
              Certidão Civil
            </h3>
            <div className="space-y-1">
              <Campo label="Tipo de Certidão" valor={dados.tipoCertidaoCivil} />
              <Campo
                label="Número da Certidão"
                valor={dados.numeroCertidaoCivil}
              />
              <Campo label="UF do Cartório" valor={dados.ufCartorio} />
              <Campo
                label="Município do Cartório"
                valor={dados.municipioCartorio}
              />
              <Campo label="Nome do Cartório" valor={dados.nomeCartorio} />
              <Campo label="Número do Termo" valor={dados.numeroTermo} />
              <Campo
                label="Data de Emissão"
                valor={dados.dataEmissaoCertidao}
              />
              <Campo label="Estado" valor={dados.estadoCertidao} />
              <Campo label="Folha" valor={dados.folhaCertidao} />
              <Campo label="Livro" valor={dados.livroCertidao} />
            </div>
          </section>
        )}
      </div>

      {/* Footer com botões */}
      <ModalFooter>
        <Button variant="ghost" onClick={onCancelar} disabled={isSalvando}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirmar}
          disabled={isSalvando || (precisaConfirmarSexo && !sexoSelecionado)}
        >
          {isSalvando ? "Salvando..." : "Confirmar e Salvar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

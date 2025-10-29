# 📘 Manual do Usuário - Sistema de Certificados

> **Para quem é este manual?** Qualquer pessoa que vai usar o sistema no dia-a-dia para emitir certificados e gerenciar dados de alunos.

---

## 🎯 O que este sistema faz?

Este sistema ajuda a:
- ✅ Importar dados de alunos do sistema Conexão Educação (arquivos CSV)
- ✅ Organizar alunos por período letivo, modalidade e turma
- ✅ Verificar pendências e inconsistências nos dados
- ✅ Emitir certificados e certidões de conclusão do Ensino Médio
- ✅ Gerenciar históricos escolares

---

## 🚀 Como Começar

### 1. Abrir o Sistema

**Se estiver no computador servidor:**
- Abra o navegador
- Digite: `http://localhost:3000`

**Se estiver em outro computador:**
- Abra o navegador
- Digite: `http://SERVIDOR-ESCOLA:3000` (ou o IP do servidor)
- Ou clique no atalho na área de trabalho (se foi criado)

### 2. Primeira Vez?

Na primeira vez, você verá a tela inicial do sistema vazia.
Precisará importar os arquivos CSV do sistema Conexão Educação.

---

## 📂 Importar Arquivos de Dados

### Passo 1: Obter os arquivos do Conexão Educação

Você precisará baixar do sistema Conexão Educação os seguintes relatórios em formato CSV:

1. **Ata de Resultados Finais** (`Ata_resultados_finais.csv`)
2. **Relatório de Acompanhamento de Enturmação** (`RelAcompEnturmacaoPorEscola.csv`)

> 💡 **Dica:** Você pode ter vários arquivos de Ata de Resultados Finais de anos diferentes.

### Passo 2: Importar no Sistema

#### 2.1 Importar Ata de Resultados Finais

1. Na tela inicial, localize o painel **"Ata de Resultados Finais"**
2. Você pode fazer o upload de 3 formas:
   - **Arrastar e soltar:** Arraste os arquivos CSV direto para o painel
   - **Clicar em "Selecionar arquivos":** Escolha um ou vários arquivos de uma vez
   - **Múltiplos uploads:** Pode adicionar mais arquivos depois

3. O sistema validará automaticamente:
   - ✅ Se o arquivo é um CSV válido
   - ✅ Se contém as colunas necessárias
   - ✅ Se já existe arquivo com conteúdo idêntico (evita duplicatas)

4. Após o upload bem-sucedido:
   - Aparecerá um resumo clicável mostrando quantos arquivos foram carregados
   - Os dados serão automaticamente organizados nas abas

#### 2.2 Importar Relatório de Enturmação

1. No painel **"Relatório de Acompanhamento de Enturmação"**
2. Faça o upload do arquivo CSV
3. Este arquivo complementa os dados pessoais dos alunos

---

## 📊 Navegar pelos Dados Importados

Após importar os arquivos, você verá os dados organizados em **3 níveis de abas**:

### Nível 1: Período Letivo
- Abas maiores no topo (ex: 2020, 2021, 2022, 2023)
- Mostra quantas modalidades existem naquele ano
- Botão **"Excluir período"** para remover todos os dados daquele ano

### Nível 2: Modalidade
- Abas médias (ex: Regular, EJA, Novo Ensino Médio)
- Botão **"Excluir modalidade"** para remover dados daquela modalidade

### Nível 3: Lista de Turmas
- Mostra todas as turmas organizadas numericamente
- Exibe o total de turmas
- Turmas ordenadas pela parte numérica (ex: 1001, 1002, 3001, 3004)

---

## 📋 Gerenciar Arquivos Carregados

### Ver Lista de Arquivos

1. Após importar, aparecerá um botão resumido:
   ```
   X arquivos carregados
   Y registros totais
   Clique para ver detalhes →
   ```

2. Clique neste botão para abrir o modal com a lista completa

### No Modal de Arquivos

Você verá para cada arquivo:
- 📄 Nome do arquivo
- 📅 Data e hora que foi importado
- 📊 Quantidade de registros
- 🔑 Identificador único

**Ações disponíveis:**
- **Remover arquivo individual:** Botão vermelho "Remover" em cada arquivo
- **Limpar todos:** Botão "Limpar todos" no topo (remove todos os arquivos)

### Excluir Dados

Você pode remover dados de 3 formas:

1. **Por arquivo:** Remove apenas aquele arquivo específico
2. **Por período letivo:** Remove todos os dados de um ano (ex: todos de 2020)
3. **Por modalidade:** Remove dados de uma modalidade específica em um período (ex: EJA de 2021)

> ⚠️ **Atenção:** Todas as exclusões pedem confirmação antes de executar.

---

## 🔍 Buscar Alunos

_[FUNCIONALIDADE EM DESENVOLVIMENTO]_

Haverá um campo de busca destacado onde você poderá:
- Buscar por nome do aluno
- Buscar por número de matrícula
- Usar coringa `*` (ex: "AN*SON" encontra "ANDERSON")
- Busca ignora acentos automaticamente

---

## ✅ Verificar Pendências

_[FUNCIONALIDADE EM DESENVOLVIMENTO]_

O sistema verificará automaticamente:

### Nível 1: Banco de Dados e Migração
- Dados foram migrados corretamente?
- Há turmas faltando?
- Há referências quebradas?

### Nível 2: Entrega de Documentos
- Aluno entregou todos os documentos necessários?

### Nível 3: Consistência de Dados
- Dados estão completos para emissão de certificado?

### Nível 4: Histórico Escolar
- Aprovações estão corretas?
- Pontuações batem com situação final?
- Frequência está adequada?

### Nível 5: Tarefas de Impressão
- O que já foi impresso?
- O que ainda precisa ser impresso?

**Cores de Status:**
- 🔴 Vermelho: PENDENTE (precisa resolver)
- 🟠 Laranja: RESOLVENDO (em andamento)
- 🔵 Azul: OK (sem alteração)
- 🟢 Verde: CORRIGIDO (foi alterado e está ok)

---

## 📄 Emitir Documentos

_[FUNCIONALIDADE EM DESENVOLVIMENTO]_

### Certificados
- Impressão individual
- Impressão em lote por turma
- Pré-visualização antes de imprimir

### Certidões
- Impressão individual
- Impressão em lote por turma
- Pré-visualização antes de imprimir

### Históricos Escolares
- Visualização completa do histórico
- Impressão com assinatura digital

> ⚠️ **Importante:** Só pode imprimir documentos de alunos sem pendências de nível 1, 2 e 3.

---

## 💾 Sobre Salvamento de Dados

### Salvamento Automático
- ✅ Todos os uploads são salvos automaticamente
- ✅ Todas as alterações são salvas em tempo real
- ✅ Não precisa clicar em "Salvar"

### Backup Automático
- O sistema faz backup automático diariamente às 2h da manhã
- Mantém os últimos 30 dias de backup
- Não precisa fazer nada manualmente

### Dados Compartilhados
- Todos na rede veem os mesmos dados
- Alterações aparecem para todos em tempo real
- Vários usuários podem trabalhar ao mesmo tempo

---

## ❓ Perguntas Frequentes

### "Posso importar o mesmo arquivo duas vezes?"
Não há problema! O sistema detecta automaticamente conteúdo duplicado e ignora.

### "E se eu importar um arquivo errado?"
Você pode removê-lo individualmente pela lista de arquivos carregados.

### "Quantos arquivos posso importar?"
Não há limite específico. O sistema suporta grandes volumes de dados.

### "Os dados ficam salvos se eu fechar o navegador?"
Sim! Todos os dados ficam salvos no servidor.

### "Posso usar em qualquer navegador?"
Sim! Chrome, Edge, Firefox, todos funcionam.

### "E se faltar luz?"
Os dados estão salvos no servidor. Quando a luz voltar, é só abrir o sistema novamente.

---

## 🆘 Problemas Comuns

**Sistema não abre:**
- Verifique se digitou o endereço correto
- Verifique se está conectado à rede da escola
- Veja o guia **EMERGENCIA.md**

**Upload não funciona:**
- Verifique se o arquivo é CSV
- Verifique se o arquivo não está aberto no Excel
- Tente fazer o upload de um arquivo por vez

**Turma não aparece:**
- Verifique se o arquivo foi importado com sucesso
- Verifique se a modalidade/período está correto no arquivo original

**Sistema está lento:**
- Pode ser a rede da escola
- Pode ser muitos usuários ao mesmo tempo
- Tente recarregar a página (F5)

---

## 📞 Suporte

Para problemas que não conseguir resolver:

1. Leia o **EMERGENCIA.md** (soluções rápidas)
2. Entre em contato com o responsável de TI da escola
3. Se necessário, contate o suporte técnico do sistema

---

**Última atualização:** 2025-01-29
**Versão do sistema:** 1.0.0

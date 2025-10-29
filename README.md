# 🎓 Sistema de Emissão de Certificados e Certidões - Ensino Médio

Sistema web para gerenciamento e emissão de certificados, certidões e históricos escolares para alunos concluintes do Ensino Médio.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Documentação](#documentação)
- [Desenvolvimento](#desenvolvimento)
- [Deploy em Produção](#deploy-em-produção)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## 📖 Sobre o Projeto

Este sistema foi desenvolvido para escolas que utilizam o **Sistema Conexão Educação da SEEDUC-RJ**, permitindo:

- Importação de dados de arquivos CSV/XML do sistema oficial
- Organização de alunos por período letivo, modalidade e turma
- Verificação automatizada de pendências e inconsistências
- Emissão de certificados e certidões de conclusão
- Gestão de históricos escolares
- Controle de fluxo de impressão de documentos

### Público-Alvo

- **Usuários finais:** Secretarias escolares, coordenadores pedagógicos (leigos em tecnologia)
- **Ambiente:** Rede intranet de escolas públicas
- **Manutenção:** Mínima, visita anual de técnico de TI

---

## ✨ Funcionalidades

### Implementadas ✅

- [x] Upload múltiplo de arquivos CSV
- [x] Detecção automática de duplicatas por hash
- [x] Organização hierárquica de dados (Período → Modalidade → Turma)
- [x] Ordenação inteligente de turmas (por parte numérica)
- [x] Gerenciamento de arquivos carregados (adicionar/remover)
- [x] Exclusão de dados por período ou modalidade
- [x] Interface responsiva e acessível

### Em Desenvolvimento 🚧

- [ ] Migração para PostgreSQL (substituir localStorage)
- [ ] Busca avançada de alunos (nome, matrícula, wildcards)
- [ ] Verificação de pendências em 5 níveis
- [ ] Edição de dados dos alunos
- [ ] Emissão de certificados (visualização e impressão)
- [ ] Emissão de certidões
- [ ] Impressão em lote por turma
- [ ] Relatórios de status e pendências
- [ ] Sistema de backup automático

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**

### Backend (em implementação)
- **Next.js API Routes**
- **PostgreSQL** (banco de dados)
- **Prisma** (ORM)

### Deploy
- **Docker** + **Docker Compose**
- **Windows Server** (ou workstation com Windows 10/11)

### Armazenamento Atual (Temporário)
- **localStorage** (será substituído por PostgreSQL)

---

## 📚 Documentação

Guias completos para diferentes perfis de usuário:

| Documento | Público | Descrição |
|-----------|---------|-----------|
| **[INSTALACAO.md](./INSTALACAO.md)** | Técnico de TI | Guia passo-a-passo para instalação inicial (uma única vez) |
| **[MANUAL_USUARIO.md](./MANUAL_USUARIO.md)** | Usuários finais | Como usar o sistema no dia-a-dia |
| **[EMERGENCIA.md](./EMERGENCIA.md)** | Todos | Soluções rápidas para problemas comuns |
| **[MANUTENCAO.md](./MANUTENCAO.md)** | Técnico de TI | Manutenção preventiva, backup, atualização |
| **[CLAUDE.md](./CLAUDE.md)** | Desenvolvedores | Especificações técnicas e regras de negócio |

---

## 💻 Desenvolvimento

### Pré-requisitos

- Node.js 18+ ou Bun
- npm/yarn/pnpm/bun
- Docker Desktop (para desenvolvimento com PostgreSQL)

### Instalação Local

```bash
# Clonar repositório
git clone [url-do-repositorio]
cd senor_abravanel_draft-2

# Instalar dependências
npm install
# ou
bun install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Rodar desenvolvimento
npm run dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Estrutura de Pastas

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Página inicial
│   └── api/            # API Routes (futuro)
├── components/         # Componentes React
│   ├── ui/             # Componentes genéricos (Modal, Tabs)
│   ├── DropCsv.tsx     # Upload de CSV
│   └── MigrateUploads.tsx  # Painel de migração
└── lib/                # Utilitários (futuro)
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🚀 Deploy em Produção

### Arquitetura de Deploy

```
┌─────────────────────────────────┐
│  Computador Servidor (Windows)  │
│                                 │
│  ┌───────────────────────────┐ │
│  │  Docker Desktop           │ │
│  │  ┌──────────┬──────────┐ │ │
│  │  │ Next.js  │PostgreSQL│ │ │
│  │  │  :3000   │  :5432   │ │ │
│  │  └──────────┴──────────┘ │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
          │
    Rede Intranet
          │
    ┌─────┴─────┐
    ▼           ▼
[Cliente]   [Cliente]
(browser)   (browser)
```

### Passo-a-Passo

1. **Instalar Docker Desktop** no computador servidor (Windows)
2. **Copiar projeto** para `C:\Sistemas\sistema-certificados`
3. **Configurar variáveis** no arquivo `.env`
4. **Iniciar sistema** com `iniciar-sistema.bat`
5. **Acessar** de qualquer computador da rede em `http://[ip-servidor]:3000`

Veja guia completo em **[INSTALACAO.md](./INSTALACAO.md)**.

---

## 🏗️ Arquitetura

### Modelo de Dados (Conceitual)

```
Período Letivo (2020, 2021, 2022...)
  └─ Modalidade (Regular, EJA, Novo EM...)
      └─ Turma (1001, 1002, 3001...)
          └─ Aluno
              ├─ Dados Pessoais
              ├─ Dados Documentais
              ├─ Histórico Escolar
              │   └─ Períodos Curriculares (séries)
              │       └─ Componentes Curriculares (disciplinas)
              │           ├─ Pontuação
              │           └─ Frequência
              └─ Pendências
```

### Fluxo de Dados

1. **Importação** → CSV do Conexão Educação
2. **Validação** → Estrutura + Headers + Duplicatas
3. **Hash** → Detecção de arquivos idênticos
4. **Armazenamento** → PostgreSQL (em implementação)
5. **Processamento** → Organização hierárquica
6. **Verificação** → 5 níveis de pendências
7. **Resolução** → Correção de inconsistências
8. **Emissão** → Certificados e certidões

### Níveis de Verificação de Pendências

1. **Banco de Dados e Migração** - Integridade dos dados importados
2. **Entrega de Documentos** - Documentação física dos alunos
3. **Consistência de Dados** - Dados completos para emissão
4. **Histórico Escolar** - Aprovações, pontos, frequência
5. **Tarefas de Impressão** - Controle de impressões

---

## 📁 Estrutura do Projeto

```
senor_abravanel_draft-2/
├── public/              # Assets estáticos
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── page.tsx    # Página inicial
│   │   ├── layout.tsx  # Layout raiz
│   │   └── globals.css # Estilos globais
│   └── components/
│       ├── ui/         # Componentes genéricos
│       │   ├── Tabs.tsx
│       │   └── Modal.tsx
│       ├── DropCsv.tsx
│       └── MigrateUploads.tsx
├── docker-compose.yml  # (futuro) Configuração Docker
├── Dockerfile          # (futuro) Build da aplicação
├── prisma/             # (futuro) Schema do banco
│   └── schema.prisma
├── .env.example        # Exemplo de variáveis de ambiente
├── CLAUDE.md           # Especificações técnicas
├── INSTALACAO.md       # Guia de instalação
├── MANUAL_USUARIO.md   # Manual do usuário
├── EMERGENCIA.md       # Guia de emergência
├── MANUTENCAO.md       # Guia de manutenção
└── README.md           # Este arquivo
```

---

## 🧪 Testes

_Em planejamento. Pretende-se implementar:_

- Testes unitários (Vitest)
- Testes de integração (Playwright)
- Testes de componentes (Testing Library)

---

## 🤝 Contribuindo

Este é um projeto fechado/privado para uso interno de escolas.

Para suporte técnico:
- Consulte **[EMERGENCIA.md](./EMERGENCIA.md)** primeiro
- Entre em contato com o desenvolvedor responsável

---

## 📜 Licença

Todos os direitos reservados. Uso restrito para fins educacionais.

---

## 🔮 Roadmap

### Versão 1.1 (Q1 2025)
- [x] Sistema de abas multinível
- [x] Upload múltiplo de arquivos
- [ ] Migração para PostgreSQL
- [ ] API Routes completas

### Versão 1.2 (Q2 2025)
- [ ] Busca avançada de alunos
- [ ] Edição de dados
- [ ] Verificação de pendências (5 níveis)

### Versão 2.0 (Q3 2025)
- [ ] Emissão de certificados
- [ ] Emissão de certidões
- [ ] Impressão em lote
- [ ] Relatórios avançados

### Versão 2.1 (Q4 2025)
- [ ] Assinatura digital
- [ ] Integração com sistema nacional
- [ ] App mobile (consulta)

---

## 📞 Contato

**Desenvolvedor:** [Nome]
**Email:** [email@exemplo.com]
**GitHub:** [usuario/repositorio]

---

**Última atualização:** 2025-01-29
**Versão atual:** 1.0.0

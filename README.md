# ✈️ SkyForge — Sistema de Gerenciamento de Aeronaves

> **AV3 — Programação Orientada a Objetos (3º ADS)**  
> Projeto integrado: Backend (Console/TypeScript) + Frontend (Next.js + Prisma + MySQL)

---

## 📋 Visão Geral

O **SkyForge** é um sistema completo de gerenciamento de aeronaves que permite:

- **CRUD de Aeronaves** — Cadastro, edição e exclusão com validação Zod
- **Gestão de Peças** — Controle de status (Pendente → Aprovada → Instalada)
- **Etapas de Montagem** — Workflow com prazos e associação de funcionários
- **Registro de Testes** — Histórico de testes com status aprovado/reprovado
- **CRUD de Funcionários** — Gerenciamento com controle de permissões (RBAC)
- **Dashboard** — Métricas em tempo real do sistema
- **Autenticação Segura** — Sessões via cookies HMAC SHA-256 (HttpOnly, Secure, SameSite=Strict)

> 💡 **Easter Egg:** Experimente tentar cadastrar um funcionário com o nome `gerson`. O sistema possui uma trava de segurança especial contra pessoas "gênias" demais!

---

## 📊 Relatório de Performance

Avaliamos a capacidade de resposta e latência do sistema SkyForge sob concorrência (1, 5 e 10 usuários simultâneos). Os dados detalhados, metodologia e os gráficos em *Mermaid.js* estão disponíveis no nosso documento oficial:
👉 **[Ler o Relatório de Performance e Carga da AV3](relatorio_performance.md)**

---

## 🏗️ Arquitetura

```
AV3-POO-3ADS/
├── backend/              # Backend console (TypeScript) — AV1
│   ├── src/
│   │   ├── index.ts      # Menu principal
│   │   ├── models.ts     # Classes OOP (Aeronave, Funcionário, etc.)
│   │   ├── auth.ts       # Autenticação console
│   │   ├── storage.ts    # Persistência em JSON
│   │   └── ...
│   ├── dados/            # Arquivos JSON de dados
│   └── package.json
│
├── frontend/             # Frontend web (Next.js 16) — AV2 + melhorias AV3
│   ├── app/              # App Router (páginas e layouts)
│   ├── components/       # Componentes reutilizáveis (Layout, UI)
│   ├── lib/
│   │   ├── server-actions.ts  # Server Actions com RBAC
│   │   ├── session.ts         # Sessões criptográficas HMAC
│   │   ├── auth-context.tsx   # Contexto de autenticação React
│   │   ├── types.ts           # Tipos e hierarquia de permissões
│   │   └── validators.ts      # Validadores e sanitizadores
│   ├── prisma/           # Schema e migrations do banco
│   ├── middleware.ts      # Proteção de rotas server-side
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml    # MySQL + Frontend containerizados
└── .gitignore
```

---

## 🔐 Segurança

| Camada | Implementação |
|---|---|
| **Sessões** | Cookies HMAC SHA-256, HttpOnly, Secure, SameSite=Strict |
| **RBAC** | 3 níveis: `OPERADOR` < `ENGENHEIRO` < `ADMINISTRADOR` |
| **Middleware** | Verificação server-side antes do React renderizar |
| **Server Actions** | `requirePermission()` em todas as 20+ ações |
| **Senhas** | Hash bcrypt (custo 10) |
| **Validação** | Zod schemas + sanitização de strings |

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- MySQL 8+
- npm ou yarn

### 1. Backend (Console)
```bash
cd backend
npm install
npm start
```

### 2. Frontend (Web)

#### Com Docker (recomendado)
```bash
docker-compose up -d
```
O MySQL será provisionado automaticamente e o frontend estará em `http://localhost:3000`.

#### Sem Docker (manual)
```bash
cd frontend
npm install

# Configure o banco de dados
# Crie o arquivo .env com:
# DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/skyforge"

# Execute as migrations
npx prisma migrate deploy

# (Opcional) Popule com dados iniciais
npx prisma db seed

# Inicie o servidor de desenvolvimento
npm run dev
```
Acesse `http://localhost:3000`.

### Credenciais Padrão (Seed)
| Usuário | Senha | Nível |
|---|---|---|
| `admin` | `admin123` | ADMINISTRADOR |
| `eng` | `eng123` | ENGENHEIRO |
| `op` | `op123` | OPERADOR |

---

## 🛠️ Tecnologias

| Componente | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Estilização | Tailwind CSS 4 |
| ORM | Prisma 6 |
| Banco de Dados | MySQL 8 |
| Validação | Zod |
| Ícones | Lucide React |
| Notificações | React Hot Toast |
| Containers | Docker + Docker Compose |
| Backend Console | TypeScript + readline-sync |

---

## 📄 Licença

Projeto acadêmico — FATEC, 3º semestre de Análise e Desenvolvimento de Sistemas.

# 🏋️ Academia — Sistema de Gestão de Academia

[![CI](https://github.com/MauricioOliveiraAmorim/Academia/actions/workflows/ci.yml/badge.svg)](https://github.com/MauricioOliveiraAmorim/Academia/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**🔗 Demo ao vivo:** [academia-ten-omega.vercel.app](https://academia-ten-omega.vercel.app/)
*(A API roda no plano free do Render e "dorme" após 15 min sem uso — a primeira requisição depois disso pode levar ~30-60s para responder.)*

Aplicação fullstack para gestão de academias: cadastro de alunos e instrutores, controle de frequência, planos de treino e catálogo de exercícios, com autenticação JWT baseada em papel (role) e posse (ownership) dos dados.

Read this in [English](#-english) below.

---

## 🧰 Stack

| Camada | Tecnologias |
|---|---|
| **Frontend** | React 19 (Vite), React Router, Tailwind CSS v4, Axios |
| **Backend** | Node.js, Express 5, Prisma ORM |
| **Banco de dados** | PostgreSQL |
| **Autenticação** | JWT + bcrypt, controle por papel (Aluno/Instrutor) e por posse dos dados |
| **Testes** | Jest (backend, 55 testes / ~92% cobertura na camada de negócio) + Vitest/Testing Library (frontend) |
| **Infra** | Docker Compose (dev local), GitHub Actions (CI), deploy em Render + Vercel + Neon |

## 🏗️ Arquitetura

Backend em três camadas:

```
Controller (HTTP)  →  Service (regras de negócio)  →  DAO (acesso a dados / Prisma)
```

Toda rota (exceto login/registro) passa por middleware de autenticação JWT e checagem de papel/posse — um Aluno só acessa os próprios dados, um Instrutor acessa tudo.

## 📁 Estrutura

```
Academia/
├── api/                    # Backend (Node + Express + Prisma)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dao/
│   │   ├── middlewares/    # autenticação/autorização JWT
│   │   └── utils/
│   ├── prisma/schema.prisma
│   └── *.test.js           # testes Jest ao lado do código testado
├── web/                    # Frontend (React + Vite + Tailwind)
│   └── src/
├── postgres/academia.sql   # schema inicial (usado pelo Docker Compose)
├── docker-compose.yml      # Postgres local pra desenvolvimento
├── render.yaml             # Blueprint de deploy da API no Render
└── .github/workflows/ci.yml
```

## ✅ Funcionalidades

- **Autenticação**: registro (Aluno ou Instrutor) e login com JWT, senha com hash bcrypt
- **Autorização**: rotas restritas por papel (ex.: só Instrutor cria exercícios) e por posse (Aluno só vê/edita os próprios dados)
- **Alunos** e **Instrutores**: cadastro, listagem, remoção
- **Frequência**: marcação de presença/falta por dia, com constraint única (sem duplicar registro do mesmo aluno no mesmo dia)
- **Planos de treino**: cabeçalho do plano + exercícios vinculados (séries, repetições, carga, descanso)
- **Exercícios**: catálogo com link de vídeo demonstrativo

## ⚙️ Rodando localmente

Requer Node ≥22.22 e Docker.

```bash
# 1. Sobe o Postgres local
docker compose up -d

# 2. Backend
cd api
npm install
cp .env.example .env   # já vem configurado pro Postgres do docker-compose; troque o JWT_SECRET por uma string sua
npx prisma generate
npm run dev             # http://localhost:3000

# 3. Frontend (em outro terminal)
cd web
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

### Testes

```bash
cd api && npm test              # Jest — 55 testes, camada de negócio
cd web && npm test               # Vitest
```

## 🚀 Deploy

- **Frontend**: [Vercel](https://vercel.com) — build estático do Vite
- **Backend**: [Render](https://render.com), provisionado via [`render.yaml`](render.yaml) (Blueprint)
- **Banco de dados**: [Neon](https://neon.tech) — Postgres serverless, free tier
- **CI**: GitHub Actions roda lint, testes e build a cada push/PR

## 🗺️ Possíveis melhorias

- Validação de dígito verificador do CPF (hoje só valida quantidade de dígitos)
- Testes de integração (supertest) contra um banco real, cobrindo a camada de DAO
- Mais cobertura de testes de frontend (hoje concentrada em utilitários)

## 📄 Licença

[MIT](LICENSE)

---

## 🇺🇸 English

Fullstack academy/gym management app: student and instructor records, attendance tracking, workout plans, and an exercise catalog, with JWT authentication enforcing both role-based and ownership-based access control.

**🔗 Live demo:** [academia-ten-omega.vercel.app](https://academia-ten-omega.vercel.app/)
*(The API runs on Render's free tier and spins down after 15 min of inactivity — the first request after that can take ~30-60s to wake up.)*

### Stack

React 19 (Vite) + Tailwind CSS on the frontend; Node.js/Express 5 + Prisma on the backend; PostgreSQL; JWT + bcrypt auth; Jest (backend, 55 tests, ~92% coverage on the business logic layer) + Vitest/Testing Library (frontend); Docker Compose for local dev; GitHub Actions CI; deployed on Render (API), Vercel (frontend), and Neon (Postgres).

### Architecture

Three-layer backend: `Controller → Service → DAO`, with a JWT middleware enforcing role checks (e.g. only instructors can create exercises) and ownership checks (a student can only read/write their own records) on every route except login/register.

### Running locally

Requires Node ≥22.22 and Docker.

```bash
docker compose up -d          # local Postgres

cd api
npm install
cp .env.example .env
npx prisma generate
npm run dev                    # http://localhost:3000

cd web
npm install
cp .env.example .env
npm run dev                    # http://localhost:5173
```

Run tests with `npm test` in `api/` (Jest) and `web/` (Vitest).

### Deploy

Frontend on Vercel, API on Render (provisioned via [`render.yaml`](render.yaml)), database on Neon (serverless Postgres, free tier). CI runs lint, tests, and build on every push/PR via GitHub Actions.

### Possible improvements

CPF checksum validation (currently only checks digit count), integration tests against a real database (covering the DAO layer), broader frontend test coverage.

### License

[MIT](LICENSE)

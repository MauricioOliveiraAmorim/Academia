# 🏋️ Sistema de Gestão de Academia

> Uma solução completa em arquitetura **Fullstack** para gerenciar academias, com comunicação integrada entre frontend e backend, garantindo integridade referencial em banco de dados relacional.

---

## 📋 Sobre o Projeto

Este repositório contém a implementação completa do **Sistema de Gestão de Academia**, desenvolvido como Projeto Final para a disciplina de **Ambiente de Dados**.

**Objetivo:** Demonstrar em arquitetura Fullstack a comunicação entre frontend e backend, utilizando um banco relacional com integridade referencial garantida.

---

## 🧰 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - ORM para banco de dados

### Banco de Dados
- **MySQL** - Banco relacional

### Frontend
- **React** (Vite) - Biblioteca UI
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP

---

## 🏗️ Arquitetura Aplicada

A solução segue padrões de design consolidados:

```
┌─────────────┐
│  Controller │ (Camada de Apresentação)
├─────────────┤
│   Service   │ (Lógica de Negócio)
├─────────────┤
│     DAO     │ (Acesso a Dados)
└─────────────┘
```

- **DAO** - Acesso aos dados
- **Service** - Regras de negócio
- **Controller** - Endpoints da API

---

## 📁 Estrutura do Projeto

```
Academia/
├── api/              # Backend (Node.js + Prisma)
│   ├── src/
│   ├── .env
│   ├── server.js
│   ├── package.json
│   └── mysql/        # Script SQL do Banco
│       └── academia_script.sql
│
└── web/              # Frontend (React + Vite)
    ├── src/
    ├── vite.config.js
    ├── package.json
    └── index.html
```

---

## ✅ Funcionalidades Implementadas

### 🔐 Autenticação

| Função | Descrição |
|--------|-----------|
| **Login** | Acesso ao sistema |
| **Registro de usuário** | Criação de aluno ou instrutor |
| **Segurança** | Rotas protegidas |
| **Transação** | Registro feito de forma transacional |

### 📚 Módulos do Sistema

| Módulo | Funcionalidades |
|--------|-----------------|
| **Aluno** | Cadastro / Listagem / Remoção |
| **Instrutor** | Cadastro / Listagem / Remoção |
| **Exercício** | Catálogo de exercícios |
| **Frequência** | Registro e consulta de presença/falta |
| **Plano de Treino** | Cadastro do plano (cabeçalho) |
| **Plano Exercício** | Vínculo N:N entre Plano e Exercício com séries/repetições/carga |

---

## ⚙️ Guia de Instalação

### 1️⃣ Banco de Dados

```bash
# Criar o banco de dados
CREATE DATABASE Academia;

# Executar o script SQL
mysql -u USUARIO -p Academia < api/mysql/academia_script.sql
```

### 2️⃣ Backend (API)

```bash
# Entrar no diretório
cd api

# Instalar dependências
npm install
```

Criar arquivo `.env`:
```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/Academia"
```

Sincronizar Prisma:
```bash
npx prisma db pull
npx prisma generate
```

Iniciar servidor:
```bash
node server.js
```

✅ Backend rodando em: **http://localhost:3000**

### 3️⃣ Frontend (Web)

```bash
# Entrar no diretório
cd web

# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev
```

✅ Frontend disponível em: **http://localhost:5173**

---

## 🖥️ Funcionamento do Sistema

### Fluxo de Acesso

```
1. Página inicial → /login
   │
   ├─ Possui conta? → Fazer login
   │
   └─ Não possui? → /registro
      │
      ├─ Escolher Aluno ou Instrutor
      │
      └─ Registro cria:
         ├─ Perfil do usuário
         └─ Registro de login (transacional)

2. Após login → /dashboard

3. Dashboard disponibiliza:
   ├─ Alunos
   ├─ Instrutores
   ├─ Exercícios
   ├─ Frequência
   └─ Planos de treino
```

---

## 🏆 Boas Práticas Aplicadas

- ✔️ **Arquitetura em três camadas** - Separação clara de responsabilidades
- ✔️ **Integração com banco via Prisma** - ORM moderno e type-safe
- ✔️ **Integridade referencial** - Relacionamentos garantidos no BD
- ✔️ **Transações implementadas** - Operações atômicas
- ✔️ **Tratamento de erros centralizado** - Middleware de erro
- ✔️ **Rotas protegidas** - Autenticação obrigatória
- ✔️ **APIs REST** - Padrão RESTful bem definido

---

## 🔗 Links Úteis

- **Repositório GitHub:** [Academia - Mauricio Oliveira Amorim](https://github.com/MauricioOliveiraAmorim/Academia)

- **Link da Parte 1 (Entrega anterior):** https://github.com/naok1m/delivery-app
---

## 📝 Notas

- O sistema utiliza sessões para manter o usuário autenticado
- Todas as operações de registro são transacionais para evitar inconsistências
- A integridade referencial é garantida pelo banco de dados
- O frontend comunica com a API via Axios

---

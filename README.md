🏋️ Sistema de Gestão de Academia

Este repositório contém a implementação completa do Sistema de Gestão de Academia, desenvolvido como Projeto Final para a disciplina de Ambiente de Dados.

O objetivo do sistema é demonstrar, em arquitetura Fullstack, a comunicação entre frontend e backend, usando banco relacional com integridade referencial garantida.

🧰 Tecnologias Utilizadas
Backend

Node.js

Express.js

Prisma ORM

Banco de Dados

MySQL

Frontend

React (Vite)

React Router DOM

Axios

Arquitetura

DAO

Service

Controller

📁 Estrutura do Projeto
Academia/
├── api/          # Backend (Node.js + Prisma)
│   └── mysql/    # Script SQL do Banco
└── web/          # Frontend (React)

✅ Funcionalidades Implementadas
Autenticação
Função	Descrição
Login	Acesso ao sistema
Registro	Criação de aluno/instrutor
Segurança	Rotas protegidas no frontend
Detalhe Técnico	Registro transacional
Módulos do Sistema
Módulo	Funcionalidades
Aluno	Cadastro / Listagem / Remoção
Instrutor	Cadastro / Listagem / Remoção
Exercício	Catálogo / Registro / Exclusão
Frequência	Registro e consulta de presença/falta
Plano de Treino	Criação do cabeçalho do plano
Plano Exercício	Série / Repetições / Carga (ligação N:N)
⚙️ Guia de Instalação
1. Banco de Dados

Crie um banco chamado Academia

Execute o script SQL em:

api/mysql/academia_script.sql

2. Backend
cd api
npm install


Criar arquivo .env com:

DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/Academia"


Sincronizar Prisma:

npx prisma db pull
npx prisma generate


Iniciar servidor:

node server.js


Backend disponível em: http://localhost:3000

3. Frontend
cd web
npm install
npm run dev


Frontend em: http://localhost:5173

🖥️ Funcionamento do Sistema
Autenticação

Login inicial

Se não cadastrado → Registro

Escolher tipo (Aluno/Instrutor)

Registro cria:

Perfil

Login vinculado
(em transação)

Redirecionamento para Dashboard

Dashboard – Módulos

Alunos

Exercícios

Frequência

Planos

Instrutores

🏗️ Boas Práticas Aplicadas

✔ Arquitetura em três camadas
✔ Prisma ORM com integridade referencial
✔ Transações implementadas
✔ Controle de acesso por sessão/token
✔ Padrão REST

🔗 Repositório

https://github.com/MauricioOliveiraAmorim/Academia

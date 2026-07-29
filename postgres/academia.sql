CREATE TYPE login_tipousuario AS ENUM ('Aluno', 'Instrutor');
CREATE TYPE frequencia_presenca AS ENUM ('Falta', 'Presente');

-- Tabela de Aluno
CREATE TABLE "Aluno" (
  id_aluno SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf CHAR(11) UNIQUE NOT NULL,
  datamatricula DATE
);

-- Tabela de Instrutor
CREATE TABLE "Instrutor" (
  id_instrutor SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especialidade VARCHAR(50) NOT NULL
);

-- Tabela de Frequência
CREATE TABLE "Frequencia" (
  id_frequencia SERIAL PRIMARY KEY,
  id_aluno INT NOT NULL REFERENCES "Aluno"(id_aluno),
  dia DATE NOT NULL,
  presenca frequencia_presenca NOT NULL,
  UNIQUE (id_aluno, dia)
);

-- Tabela de Plano de Treino
CREATE TABLE "PlanoTreino" (
  id_planotreino SERIAL PRIMARY KEY,
  id_aluno INT NOT NULL REFERENCES "Aluno"(id_aluno),
  id_instrutor INT NOT NULL REFERENCES "Instrutor"(id_instrutor),
  descricao VARCHAR(256),
  duracao INT NOT NULL, -- semanas
  nome VARCHAR(50)
);

-- Tabela de Exercício
CREATE TABLE "Exercicio" (
  id_exercicio SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  grupomuscular VARCHAR(100) NOT NULL,
  equipamento VARCHAR(100) NOT NULL,
  descricao VARCHAR(256),
  url_video VARCHAR(512)
);

-- Tabela de Plano de Exercício
CREATE TABLE "PlanoExercicio" (
  id_planoexercicio SERIAL PRIMARY KEY,
  id_planotreino INT NOT NULL REFERENCES "PlanoTreino"(id_planotreino),
  id_exercicio INT NOT NULL REFERENCES "Exercicio"(id_exercicio),
  series INT NOT NULL,
  repeticoes INT NOT NULL,
  carga INT,
  descanso TIME(0)
);

-- Tabela de Login
CREATE TABLE "Login" (
  id_login SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL,
  tipousuario login_tipousuario NOT NULL,
  referencia INT NOT NULL
);

CREATE INDEX idx_frequencia_id_aluno ON "Frequencia"(id_aluno);
CREATE INDEX idx_planotreino_id_aluno ON "PlanoTreino"(id_aluno);
CREATE INDEX idx_planotreino_id_instrutor ON "PlanoTreino"(id_instrutor);
CREATE INDEX idx_planoexercicio_id_planotreino ON "PlanoExercicio"(id_planotreino);
CREATE INDEX idx_planoexercicio_id_exercicio ON "PlanoExercicio"(id_exercicio);

CREATE DATABASE IF NOT EXISTS Academia;
USE Academia;

-- Tabela de Aluno
CREATE TABLE Aluno (
  id_aluno INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf CHAR(14) UNIQUE NOT NULL,
  datamatricula DATE
);

-- Tabela de Instrutor
CREATE TABLE Instrutor (
  id_instrutor INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especialidade VARCHAR(50) NOT NULL
);

-- Tabela de Frequência
CREATE TABLE Frequencia (
  id_frequencia INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno INT NOT NULL,
  dia DATE NOT NULL,
  presenca ENUM('Falta', 'Presente') NOT NULL,
  FOREIGN KEY (id_aluno) REFERENCES Aluno(id_aluno)
);

-- Tabela de Plano de Treino
CREATE TABLE PlanoTreino (
  id_planotreino INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno INT NOT NULL,
  id_instrutor INT NOT NULL,
  descricao VARCHAR(256),
  duracao INT NOT NULL, -- semanas
  nome VARCHAR(50),
  FOREIGN KEY (id_aluno) REFERENCES Aluno(id_aluno),
  FOREIGN KEY (id_instrutor) REFERENCES Instrutor(id_instrutor)
);

-- Tabela de Exercício
CREATE TABLE Exercicio (
  id_exercicio INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  grupomuscular VARCHAR(100) NOT NULL,
  equipamento VARCHAR(100) NOT NULL,
  descricao VARCHAR(256)
);

-- Tabela de Plano de Exercício
CREATE TABLE PlanoExercicio (
  id_planoexercicio INT AUTO_INCREMENT PRIMARY KEY,
  id_planotreino INT NOT NULL,
  id_exercicio INT NOT NULL,
  series INT NOT NULL,
  repeticoes INT NOT NULL,
  carga INT,
  descanso TIME,
  FOREIGN KEY (id_planotreino) REFERENCES PlanoTreino(id_planotreino),
  FOREIGN KEY (id_exercicio) REFERENCES Exercicio(id_exercicio)
);

-- Tabela de Login
CREATE TABLE Login (
  id_login INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL,
  tipousuario ENUM('Aluno', 'Instrutor') NOT NULL,
  referencia INT NOT NULL
);




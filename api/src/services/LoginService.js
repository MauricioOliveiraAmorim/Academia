const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const loginDAO = require('../dao/LoginDAO');
const prisma = require('../prismaClient');
const { cleanAndValidateCpf } = require('../utils/cpf');

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '8h';

class LoginService {
    async registrarNovoUsuario(dadosRegistro) {
        // Renomeia 'cpf' para 'rawCpf' para evitar conflito com a variável limpa
        const { nome, email, senha, tipo, cpf: rawCpf, especialidade } = dadosRegistro; 
        let { datamatricula } = dadosRegistro; 

        if (!nome || !email || !senha || !tipo) {
            throw new Error("Campos básicos (Nome, Email, Senha, Senha, Tipo) são obrigatórios.");
        }
        
        // 1. VERIFICAÇÃO DE UNICIDADE DO E-MAIL (Correção anterior)
        const loginExistente = await prisma.login.findUnique({
            where: { email: email }
        });

        if (loginExistente) {
            throw new Error("Este e-mail já está registrado em nosso sistema.");
        }

        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        let dadosPerfil = {};
        let dadosLogin = { email, senha: senhaHash, tipousuario: tipo };
        
        // 2. VERIFICAÇÕES ESPECÍFICAS DE PERFIL (INCLUINDO CPF)
        if (tipo === 'Aluno') {
            if (!rawCpf) throw new Error("CPF é obrigatório para Aluno.");
            
            let cpf;
            try {
                // NOVO: Limpa e Valida o formato do CPF. Lança erro se for inválido.
                cpf = cleanAndValidateCpf(rawCpf);
            } catch (error) {
                // Propaga o erro de formato para o Controller/Frontend
                throw error; 
            }
            
            // NOVO: Verifica se o CPF já existe na tabela Aluno (unicidade)
            const alunoExistente = await prisma.aluno.findUnique({
                where: { cpf: cpf } // Busca usando o CPF limpo (11 dígitos)
            });
            
            if (alunoExistente) {
                throw new Error("Este CPF já está associado a outro aluno.");
            }
            
            // Atribui a data de matrícula se estiver ausente
            if (!datamatricula) {
                datamatricula = new Date(); 
            }
            
            // Usa o CPF limpo (variável 'cpf') para inserir no banco
            dadosPerfil = { nome, cpf, datamatricula }; 
            
        } else if (tipo === 'Instrutor') {
            if (!especialidade) throw new Error("Especialidade é obrigatória para Instrutor.");
            dadosPerfil = { nome, especialidade };
        } else {
            throw new Error("Tipo de perfil não suportado.");
        }

        // Chama o DAO para iniciar a transação de criação
        const { perfil, novoLogin } = await loginDAO.registrar(tipo.toLowerCase(), dadosPerfil, dadosLogin);

        // Nunca devolve o hash da senha para o cliente
        const { senha: _senha, ...loginSemSenha } = novoLogin;

        const payload = { id: novoLogin.referencia, tipo: novoLogin.tipousuario, email: novoLogin.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return { perfil, novoLogin: loginSemSenha, token };
    }

    async autenticar(email, senha) {
        // Busca o login pelo email
        const login = await prisma.login.findUnique({
            where: { email }
        });

        if (!login) {
            throw new Error("E-mail não encontrado.");
        }

        const senhaValida = await bcrypt.compare(senha, login.senha);
        if (!senhaValida) {
            throw new Error("Senha incorreta.");
        }

        const payload = { id: login.referencia, tipo: login.tipousuario, email: login.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return {
            mensagem: "Login efetuado com sucesso.",
            id: login.referencia,
            tipo: login.tipousuario,
            token
        };
    }
}

module.exports = new LoginService();
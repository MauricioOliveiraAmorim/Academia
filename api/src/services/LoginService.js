const loginDAO = require('../dao/LoginDAO');
const prisma = require('../prismaClient');

// Função auxiliar para limpar e validar o formato do CPF (11 dígitos)
function cleanAndValidateCpf(cpf) {
    if (!cpf) return null;
    
    // Remove todos os caracteres não-dígitos (pontos, traços, etc.)
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Verifica se o CPF tem exatamente 11 dígitos
    if (cleanCpf.length !== 11) {
        throw new Error("Formato de CPF inválido. O CPF deve conter 11 dígitos.");
    }
    
    // Em um ambiente de produção, adicionaríamos aqui a lógica dos dígitos verificadores.
    return cleanCpf;
}

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

        let dadosPerfil = {};
        let dadosLogin = { email, senha, tipousuario: tipo };
        
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
        return await loginDAO.registrar(tipo.toLowerCase(), dadosPerfil, dadosLogin);
    }

    async autenticar(email, senha) {
        // Busca o login pelo email
        const login = await prisma.login.findUnique({
            where: { email }
        });

        if (!login) {
            throw new Error("E-mail não encontrado.");
        }

        if (login.senha !== senha) {
            throw new Error("Senha incorreta.");
        }
        
        return {
            mensagem: "Login efetuado com sucesso.",
            id: login.referencia, 
            tipo: login.tipousuario
        };
    }
}

module.exports = new LoginService();
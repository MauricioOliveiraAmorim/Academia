const prisma = require('../prismaClient');

class LoginDAO {
    // Esta função contém a transação completa: cria o perfil e a conta de login
    async registrar(tipoUsuario, dadosPerfil, dadosLogin) {
        
        // Prisma.$transaction garante que se qualquer uma das operações falhar,
        // todas as outras são desfeitas (rollback).
        return await prisma.$transaction(async (tx) => {
            let perfil;
            let referenciaId;
            
            // 1. Cria o Perfil (Aluno ou Instrutor)
            if (tipoUsuario === 'aluno') {
                perfil = await tx.aluno.create({ data: dadosPerfil });
                referenciaId = perfil.id_aluno;
            } else if (tipoUsuario === 'instrutor') {
                perfil = await tx.instrutor.create({ data: dadosPerfil });
                referenciaId = perfil.id_instrutor;
            } else {
                throw new Error("Tipo de usuário inválido.");
            }

            // 2. Cria o registro de Login, vinculando ao ID do perfil criado
            const novoLogin = await tx.login.create({
                data: {
                    email: dadosLogin.email,
                    senha: dadosLogin.senha,
                    tipousuario: dadosLogin.tipousuario,
                    referencia: referenciaId,
                },
            });

            return { perfil, novoLogin };
        });
    }

    // Você precisará de funções para buscar e validar login depois, mas por hora, focar no registro.
}

module.exports = new LoginDAO();
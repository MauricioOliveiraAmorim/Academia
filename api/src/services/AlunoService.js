const alunoDAO = require('../dao/AlunoDAO');

class AlunoService {
    async criarAluno(nome, cpf, datamatricula) {
        // Regra de negócio: Verificar se dados obrigatórios existem
        if (!nome || !cpf) {
            throw new Error("Nome e CPF são obrigatórios.");
        }
        
        // Se tudo ok, chama o DAO
        return await alunoDAO.criar({ nome, cpf, datamatricula });
    }

    async listarAlunos() {
        return await alunoDAO.listarTodos();
    }

    async buscarAluno(id) {
        const aluno = await alunoDAO.buscarPorId(id);
        if (!aluno) {
            throw new Error("Aluno não encontrado.");
        }
        return aluno;
    }

    async atualizarAluno(id, dados) {
        // Poderia validar CPF aqui também
        return await alunoDAO.atualizar(id, dados);
    }

    async deletarAluno(id) {
        return await alunoDAO.deletar(id);
    }
}

module.exports = new AlunoService();
const instrutorDAO = require('../dao/InstrutorDAO');

class InstrutorService {
    async criarInstrutor(nome, especialidade) {
        if (!nome || !especialidade) {
            throw new Error("Nome e Especialidade são obrigatórios.");
        }
        return await instrutorDAO.criar({ nome, especialidade });
    }

    async listarInstrutores() {
        return await instrutorDAO.listarTodos();
    }

    async deletarInstrutor(id) {
        return await instrutorDAO.deletar(id);
    }
}

module.exports = new InstrutorService();
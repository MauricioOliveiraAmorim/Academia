const planoTreinoDAO = require('../dao/PlanoTreinoDAO');

class PlanoTreinoService {
    async criarPlano(id_aluno, id_instrutor, nome, descricao, duracao) {
        if (!id_aluno || !id_instrutor) throw new Error('Aluno e Instrutor são obrigatórios para criar um plano.');
        const dados = { id_aluno: parseInt(id_aluno), id_instrutor: parseInt(id_instrutor), nome, descricao, duracao };
        return await planoTreinoDAO.criar(dados);
    }

    async listarPlanos() {
        return await planoTreinoDAO.listarTodos();
    }

    async listarPorAluno(id_aluno) {
        return await planoTreinoDAO.listarPorAluno(id_aluno);
    }

    async buscar(id) {
        return await planoTreinoDAO.buscarPorId(id);
    }

    async deletar(id) {
        return await planoTreinoDAO.deletar(id);
    }
}

module.exports = new PlanoTreinoService();

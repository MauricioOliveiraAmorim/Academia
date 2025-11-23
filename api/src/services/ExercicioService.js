const exercicioDAO = require('../dao/ExercicioDAO');

class ExercicioService {
    async criarExercicio(nome, grupomuscular, equipamento, descricao) {
        if (!nome || !grupomuscular || !equipamento) {
            throw new Error("Nome, Grupo Muscular e Equipamento são obrigatórios.");
        }
        return await exercicioDAO.criar({ nome, grupomuscular, equipamento, descricao });
    }

    async listarExercicios() {
        return await exercicioDAO.listarTodos();
    }

    async deletarExercicio(id) {
        return await exercicioDAO.deletar(id);
    }
}

module.exports = new ExercicioService();
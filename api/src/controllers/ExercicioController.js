const exercicioService = require('../services/ExercicioService');

class ExercicioController {
    async criar(req, res) {
        try {
            const { nome, grupomuscular, equipamento, descricao } = req.body;
            const novoExercicio = await exercicioService.criarExercicio(nome, grupomuscular, equipamento, descricao);
            return res.status(201).json(novoExercicio);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const exercicios = await exercicioService.listarExercicios();
            return res.json(exercicios);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao listar exercícios." });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await exercicioService.deletarExercicio(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Erro ao deletar exercício." });
        }
    }
}

module.exports = new ExercicioController();
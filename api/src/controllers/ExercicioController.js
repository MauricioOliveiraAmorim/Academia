const exercicioService = require('../services/ExercicioService');

class ExercicioController {
    async criar(req, res) {
        try {
            const { nome, grupomuscular, equipamento, descricao, url_video } = req.body;
            const novoExercicio = await exercicioService.criarExercicio(nome, grupomuscular, equipamento, descricao, url_video);
            return res.status(201).json(novoExercicio);
        } catch (error) {
            console.error("Erro ao criar exercício:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const exercicios = await exercicioService.listarExercicios();
            return res.json(exercicios);
        } catch (error) {
            console.error("Erro ao listar exercícios:", error);
            return res.status(500).json({ error: "Erro ao listar exercícios." });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await exercicioService.deletarExercicio(id);
            return res.status(204).send();
        } catch (error) {
            console.error("Erro ao deletar exercício:", error);
            // P2003 é o código de erro do Prisma para violação de chave estrangeira
            if (error.code === 'P2003') {
                return res.status(400).json({ error: "Não é possível excluir este exercício pois ele está vinculado a um plano de treino." });
            }
            return res.status(500).json({ error: "Erro ao deletar exercício." });
        }
    }
}

module.exports = new ExercicioController();
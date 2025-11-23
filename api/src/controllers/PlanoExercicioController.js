const planoExercicioService = require('../services/PlanoExercicioService');

class PlanoExercicioController {
    async criar(req, res) {
        try {
            const { id_planotreino, id_exercicio, series, repeticoes, carga, descanso } = req.body;
            const novo = await planoExercicioService.criarPlanoExercicio(id_planotreino, id_exercicio, series, repeticoes, carga, descanso);
            return res.status(201).json(novo);
        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: error.message });
        }
    }

    async listarPorPlano(req, res) {
        try {
            const { id_planotreino } = req.params;
            const lista = await planoExercicioService.listarPorPlano(id_planotreino);
            return res.json(lista);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar exercícios do plano.' });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await planoExercicioService.deletar(id);
            return res.status(204).send();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar item do plano.' });
        }
    }
}

module.exports = new PlanoExercicioController();

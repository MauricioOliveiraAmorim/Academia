const planoTreinoService = require('../services/PlanoTreinoService');

class PlanoTreinoController {
    async criar(req, res) {
        try {
            const { id_aluno, id_instrutor, nome, descricao, duracao } = req.body;
            const novo = await planoTreinoService.criarPlano(id_aluno, id_instrutor, nome, descricao, duracao);
            return res.status(201).json(novo);
        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            // ?aluno=ID to filter by aluno
            const { aluno } = req.query;
            if (aluno) {
                const lista = await planoTreinoService.listarPorAluno(aluno);
                return res.json(lista);
            }
            const lista = await planoTreinoService.listarPlanos();
            return res.json(lista);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar planos de treino.' });
        }
    }

    async buscar(req, res) {
        try {
            const { id } = req.params;
            const p = await planoTreinoService.buscar(id);
            return res.json(p);
        } catch (error) {
            console.error(error);
            return res.status(404).json({ error: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await planoTreinoService.deletar(id);
            return res.status(204).send();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar plano.' });
        }
    }
}

module.exports = new PlanoTreinoController();

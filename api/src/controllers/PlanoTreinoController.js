const planoTreinoService = require('../services/PlanoTreinoService');
const { prismaErrorResponse } = require('../utils/prismaErrorResponse');

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
            // ?aluno=ID to filter by aluno; um Aluno é sempre restrito ao próprio id
            let { aluno } = req.query;
            if (req.user.tipo === 'Aluno') {
                aluno = req.user.id;
            }
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
            if (req.user.tipo === 'Aluno' && p.id_aluno !== req.user.id) {
                return res.status(403).json({ error: 'Você só pode acessar seus próprios planos.' });
            }
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
            return prismaErrorResponse(res, error, 'Erro ao deletar plano.');
        }
    }
}

module.exports = new PlanoTreinoController();

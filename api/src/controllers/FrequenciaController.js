const frequenciaService = require('../services/FrequenciaService');
const { prismaErrorResponse } = require('../utils/prismaErrorResponse');

class FrequenciaController {
    async criar(req, res) {
        try {
            const { id_aluno, dia, presenca } = req.body;
            if (req.user.tipo === 'Aluno' && req.user.id !== parseInt(id_aluno)) {
                return res.status(403).json({ error: 'Você só pode registrar sua própria frequência.' });
            }
            const novaFrequencia = await frequenciaService.registrarFrequencia(id_aluno, dia, presenca);
            return res.status(201).json(novaFrequencia);
        } catch (error) {
            console.error(error);
            return prismaErrorResponse(res, error, error.message, 400);
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { presenca } = req.body;
            if (req.user.tipo === 'Aluno') {
                const existente = await frequenciaService.buscarPorId(id);
                if (!existente || existente.id_aluno !== req.user.id) {
                    return res.status(403).json({ error: 'Você só pode atualizar sua própria frequência.' });
                }
            }
            const freq = await frequenciaService.atualizarFrequencia(id, presenca);
            return res.json(freq);
        } catch (error) {
            console.error(error);
            return prismaErrorResponse(res, error, error.message, 400);
        }
    }

    async listar(req, res) {
        try {
            let { aluno } = req.query;
            if (req.user.tipo === 'Aluno') {
                aluno = req.user.id;
            }
            const lista = aluno ? await frequenciaService.listarPorAluno(aluno) : await frequenciaService.listar();
            return res.json(lista);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao listar frequências." });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await frequenciaService.deletar(id);
            return res.status(204).send();
        } catch (error) {
            return prismaErrorResponse(res, error, "Erro ao deletar frequência.");
        }
    }
}

module.exports = new FrequenciaController();
const frequenciaService = require('../services/FrequenciaService');

class FrequenciaController {
    async criar(req, res) {
        try {
            const { id_aluno, dia, presenca } = req.body;
            const novaFrequencia = await frequenciaService.registrarFrequencia(id_aluno, dia, presenca);
            return res.status(201).json(novaFrequencia);
        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const lista = await frequenciaService.listar();
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
            return res.status(500).json({ error: "Erro ao deletar frequência." });
        }
    }
}

module.exports = new FrequenciaController();
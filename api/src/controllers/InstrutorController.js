const instrutorService = require('../services/InstrutorService');

class InstrutorController {
    async criar(req, res) {
        try {
            const { nome, especialidade } = req.body;
            const novoInstrutor = await instrutorService.criarInstrutor(nome, especialidade);
            return res.status(201).json(novoInstrutor);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const instrutores = await instrutorService.listarInstrutores();
            return res.json(instrutores);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao listar instrutores." });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await instrutorService.deletarInstrutor(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Erro ao deletar instrutor." });
        }
    }
}

module.exports = new InstrutorController();
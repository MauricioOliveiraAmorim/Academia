const alunoService = require('../services/AlunoService');

class AlunoController {
    async criar(req, res) {
            try {
                // 1. REMOVA 'datamatricula' da desestruturação do req.body
                const { nome, cpf } = req.body; 
                
                // 2. Crie a data no Controller (ou no Service, o Service é o mais indicado)
                const dataMatricula = new Date(); 
                
                // 3. Passe a data gerada para o Service
                const novoAluno = await alunoService.criarAluno(nome, cpf, dataMatricula); 
                
                return res.status(201).json(novoAluno);
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }   
    }

    async listar(req, res) {
        try {
            const alunos = await alunoService.listarAlunos();
            return res.json(alunos);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao listar alunos." });
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const aluno = await alunoService.buscarAluno(id);
            return res.json(aluno);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dados = req.body;
            const alunoAtualizado = await alunoService.atualizarAluno(id, dados);
            return res.json(alunoAtualizado);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao atualizar aluno." });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await alunoService.deletarAluno(id);
            return res.status(204).send(); // 204 = No Content
        } catch (error) {
            return res.status(500).json({ error: "Erro ao deletar aluno." });
        }
    }
}

module.exports = new AlunoController();
const alunoService = require('../services/AlunoService');
const { prismaErrorResponse } = require('../utils/prismaErrorResponse');

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
            if (req.user.tipo === 'Aluno' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ error: 'Você só pode acessar seus próprios dados.' });
            }
            const aluno = await alunoService.buscarAluno(id);
            return res.json(aluno);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            if (req.user.tipo === 'Aluno' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ error: 'Você só pode atualizar seus próprios dados.' });
            }
            const dados = req.body;
            const alunoAtualizado = await alunoService.atualizarAluno(id, dados);
            return res.json(alunoAtualizado);
        } catch (error) {
            if (!error.code) {
                // Erro de validação lançado pelo Service (ex: CPF inválido), não um erro do Prisma
                return res.status(400).json({ error: error.message });
            }
            return prismaErrorResponse(res, error, "Erro ao atualizar aluno.");
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await alunoService.deletarAluno(id);
            return res.status(204).send(); // 204 = No Content
        } catch (error) {
            return prismaErrorResponse(res, error, "Erro ao deletar aluno.");
        }
    }
}

module.exports = new AlunoController();
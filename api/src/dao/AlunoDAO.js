const prisma = require('../prismaClient');

class AlunoDAO {
    async criar(dadosAluno) {
        return await prisma.aluno.create({
            data: dadosAluno
        });
    }

    async listarTodos() {
        return await prisma.aluno.findMany({
            include: { planotreino: true }
        });
    }

    async buscarPorId(id) {
        // Converte ID para inteiro, pois no banco é INT
        return await prisma.aluno.findUnique({
            where: { id_aluno: parseInt(id) }
        });
    }

    async atualizar(id, dadosAtualizados) {
        return await prisma.aluno.update({
            where: { id_aluno: parseInt(id) },
            data: dadosAtualizados
        });
    }

    async deletar(id) {
        return await prisma.aluno.delete({
            where: { id_aluno: parseInt(id) }
        });
    }
}

module.exports = new AlunoDAO();
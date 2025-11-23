const prisma = require('../prismaClient');

class PlanoTreinoDAO {
    async criar(dados) {
        return await prisma.planotreino.create({ data: dados });
    }

    async listarTodos() {
        return await prisma.planotreino.findMany({ include: { planoexercicio: true } });
    }

    async listarPorAluno(id_aluno) {
        return await prisma.planotreino.findMany({ where: { id_aluno: parseInt(id_aluno) }, include: { planoexercicio: true } });
    }

    async buscarPorId(id) {
        return await prisma.planotreino.findUnique({ where: { id_planotreino: parseInt(id) }, include: { planoexercicio: true } });
    }

    async deletar(id) {
        return await prisma.planotreino.delete({ where: { id_planotreino: parseInt(id) } });
    }
}

module.exports = new PlanoTreinoDAO();

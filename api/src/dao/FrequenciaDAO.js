const prisma = require('../prismaClient');

class FrequenciaDAO {
    async criar(dados) {
        // dados deve conter: { id_aluno, dia, presenca }
        return await prisma.frequencia.create({
            data: dados
        });
    }

    async listarTodas() {
        return await prisma.frequencia.findMany({
            include: { dadosAluno: true } // Nome novo!
        });
    }

    async atualizar(id, dados) {
        return await prisma.frequencia.update({
            where: { id_frequencia: parseInt(id) },
            data: dados
        });
    }

    async deletar(id) {
        return await prisma.frequencia.delete({
            where: { id_frequencia: parseInt(id) }
        });
    }
}

module.exports = new FrequenciaDAO();
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

    async deletar(id) {
        return await prisma.frequencia.delete({
            where: { id_frequencia: parseInt(id) }
        });
    }
}

module.exports = new FrequenciaDAO();
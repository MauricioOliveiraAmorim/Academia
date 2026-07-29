const prisma = require('../prismaClient');

class FrequenciaDAO {
    async criar(dados) {
        // dados deve conter: { id_aluno, dia, presenca }
        // upsert: já existe frequência nesse dia para esse aluno, atualiza em vez de duplicar
        return await prisma.frequencia.upsert({
            where: { id_aluno_dia: { id_aluno: dados.id_aluno, dia: dados.dia } },
            update: { presenca: dados.presenca },
            create: dados
        });
    }

    async listarTodas() {
        return await prisma.frequencia.findMany({
            include: { dadosAluno: true } // Nome novo!
        });
    }

    async listarPorAluno(id_aluno) {
        return await prisma.frequencia.findMany({
            where: { id_aluno: parseInt(id_aluno) },
            include: { dadosAluno: true }
        });
    }

    async buscarPorId(id) {
        return await prisma.frequencia.findUnique({
            where: { id_frequencia: parseInt(id) }
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
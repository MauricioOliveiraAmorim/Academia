const prisma = require('../prismaClient');

class PlanoExercicioDAO {
    async criar(dados) {
        return await prisma.planoexercicio.create({ data: dados });
    }

    async listarPorPlano(id_planotreino) {
        return await prisma.planoexercicio.findMany({ where: { id_planotreino: parseInt(id_planotreino) }, include: { exercicio: true } });
    }

    async deletar(id) {
        return await prisma.planoexercicio.delete({ where: { id_planoexercicio: parseInt(id) } });
    }
}

module.exports = new PlanoExercicioDAO();

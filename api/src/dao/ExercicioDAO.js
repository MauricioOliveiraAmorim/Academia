const prisma = require('../prismaClient');

class ExercicioDAO {
    async criar(dados) {
        return await prisma.exercicio.create({
            data: dados
        });
    }

    async listarTodos() {
        return await prisma.exercicio.findMany();
    }

    async deletar(id) {
        return await prisma.exercicio.delete({
            where: { id_exercicio: parseInt(id) }
        });
    }
}

module.exports = new ExercicioDAO();
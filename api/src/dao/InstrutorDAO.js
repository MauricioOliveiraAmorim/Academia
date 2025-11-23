const prisma = require('../prismaClient');

class InstrutorDAO {
    async criar(dados) {
        return await prisma.instrutor.create({
            data: dados
        });
    }

    async listarTodos() {
        return await prisma.instrutor.findMany();   
    }

    async deletar(id) {
        return await prisma.instrutor.delete({
            where: { id_instrutor: parseInt(id) }
        });
    }
}

module.exports = new InstrutorDAO();
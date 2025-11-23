const frequenciaDAO = require('../dao/FrequenciaDAO');

class FrequenciaService {
    async registrarFrequencia(id_aluno, dia, presenca) {
            if (!id_aluno || !dia || !presenca) {
                throw new Error("Aluno, Data e Status são obrigatórios.");
            }
            
            // TRUQUE: Converter o texto "Presença" para o formato que o Prisma espera
            // Verifique no seu schema.prisma se é 'Presenca', 'Presen_a' ou outro.
        let statusParaOBanco = presenca;
        if (presenca === 'Presença') {
            statusParaOBanco = 'Presen_a'; // Nome exato que está no schema
        }

        const dados = {
            id_aluno: parseInt(id_aluno),
            dia: new Date(dia + "T00:00:00Z"),
            presenca: statusParaOBanco 
        };

        return await frequenciaDAO.criar(dados);
    }
    async listar() {
        return await frequenciaDAO.listarTodas();
    }

    async deletar(id) {
        return await frequenciaDAO.deletar(id);
    }
}

module.exports = new FrequenciaService();
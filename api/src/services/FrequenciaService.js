const frequenciaDAO = require('../dao/FrequenciaDAO');

class FrequenciaService {
    async registrarFrequencia(id_aluno, dia, presenca) {
            if (!id_aluno || !dia || !presenca) {
                throw new Error("Aluno, Data e Status são obrigatórios.");
            }
            
        let statusParaOBanco = presenca;
        // Mapeia para o Enum do Prisma (Presente ou Falta)
        if (presenca === 'Presença' || presenca === 'Presente') {
            statusParaOBanco = 'Presente';
        } else if (presenca === 'Falta') {
            statusParaOBanco = 'Falta';
        } else {
             throw new Error("Status inválido. Use 'Presente' ou 'Falta'.");
        }

        const dados = {
            id_aluno: parseInt(id_aluno),
            dia: new Date(dia), // Aceita YYYY-MM-DD ou ISO
            presenca: statusParaOBanco 
        };

        return await frequenciaDAO.criar(dados);
    }

    async atualizarFrequencia(id, presenca) {
        if (!id || !presenca) {
            throw new Error("ID e Status são obrigatórios.");
        }
        const dados = { presenca };
        return await frequenciaDAO.atualizar(id, dados);
    }

    async listar() {
        return await frequenciaDAO.listarTodas();
    }

    async deletar(id) {
        return await frequenciaDAO.deletar(id);
    }
}

module.exports = new FrequenciaService();
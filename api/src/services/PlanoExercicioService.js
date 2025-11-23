const planoExercicioDAO = require('../dao/PlanoExercicioDAO'); // Variável definida como 'planoExercicioDAO'

class PlanoExercicioService {
    async criarPlanoExercicio(id_planotreino, id_exercicio, series, repeticoes, carga, descanso) {
        if (!id_planotreino || !id_exercicio) throw new Error('Plano e Exercício são obrigatórios.');
        
        // descanso vem como string TIME (HH:MM:SS) e precisa ser convertido para DateTime
        let descansoDate = null;
        if (descanso) {
            if (typeof descanso === 'string' && descanso.includes(':')) {
                // "00:01:00" -> converte para Date do dia 1970-01-01 com esse horário
                const [h, m, s] = descanso.split(':');
                descansoDate = new Date(`1970-01-01T${h}:${m}:${s}Z`);
            } else if (typeof descanso === 'number') {
                // Converter segundos para TIME format e depois para Date
                const seconds = parseInt(descanso);
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                descansoDate = new Date(`1970-01-01T${timeStr}Z`);
            }
        }
        
        // normalizar números
        const s = parseInt(series || 0);
        const r = parseInt(repeticoes || 0);
        const c = parseInt(carga || 0);

        if (isNaN(s) || isNaN(r) || isNaN(c)) {
            throw new Error('Séries, repetições e carga devem ser números válidos.');
        }

        const dados = { id_planotreino: parseInt(id_planotreino), id_exercicio: parseInt(id_exercicio), series: s, repeticoes: r, carga: c, descanso: descansoDate };
        // Correção aqui: Deve ser planoExercicioDAO.criar(dados);
        return await planoExercicioDAO.criar(dados); 
    }

    async listarPorPlano(id_planotreino) {
        // CORREÇÃO: Usando a variável definida: planoExercicioDAO
        return await planoExercicioDAO.listarPorPlano(id_planotreino);
    }

    async deletar(id) {
        // CORREÇÃO: Usando a variável definida: planoExercicioDAO
        return await planoExercicioDAO.deletar(id);
    }
}

module.exports = new PlanoExercicioService();
import api from './api';

class PlanoExercicioService {
    criar(dados) {
        return api.post('/planoexercicios', dados);
    }

    listarPorPlano(id_planotreino) {
        return api.get(`/planoexercicios/plano/${id_planotreino}`);
    }

    deletar(id) {
        return api.delete(`/planoexercicios/${id}`);
    }
}

export default new PlanoExercicioService();

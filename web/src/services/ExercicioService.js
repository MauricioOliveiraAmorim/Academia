import api from './api';

class ExercicioService {
    listar() {
        return api.get('/exercicios');
    }

    criar(dados) {
        return api.post('/exercicios', dados);
    }

    deletar(id) {
        return api.delete(`/exercicios/${id}`);
    }
}

export default new ExercicioService();
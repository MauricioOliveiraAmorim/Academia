import api from './api';

class InstrutorService {
    listar() {
        return api.get('/instrutores');
    }

    criar(dados) {
        return api.post('/instrutores', dados);
    }

    deletar(id) {
        return api.delete(`/instrutores/${id}`);
    }
}

export default new InstrutorService();
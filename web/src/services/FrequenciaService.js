import api from './api';

class FrequenciaService {
    listar() {
        return api.get('/frequencias');
    }
    criar(dados) {
        return api.post('/frequencias', dados);
    }
    deletar(id) {
        return api.delete(`/frequencias/${id}`);
    }
}

export default new FrequenciaService();
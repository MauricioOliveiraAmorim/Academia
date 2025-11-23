import api from './api';

class PlanoTreinoService {
    listar(alunoId) {
        if (alunoId) return api.get(`/planotreinos?aluno=${alunoId}`);
        return api.get('/planotreinos');
    }

    criar(dados) {
        return api.post('/planotreinos', dados);
    }

    buscar(id) {
        return api.get(`/planotreinos/${id}`);
    }

    deletar(id) {
        return api.delete(`/planotreinos/${id}`);
    }
}

export default new PlanoTreinoService();

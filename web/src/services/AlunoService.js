import api from './api';

class AlunoService {
    // Busca todos os alunos
    listar() {
        return api.get('/alunos');
    }

    buscar(id) {
        return api.get(`/alunos/${id}`);
    }

    // Envia um novo aluno
    criar(dadosAluno) {
        return api.post('/alunos', dadosAluno);
    }

    // Deleta um aluno
    deletar(id) {
        return api.delete(`/alunos/${id}`);
    }
}

export default new AlunoService();
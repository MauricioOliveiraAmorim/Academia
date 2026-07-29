jest.mock('../dao/AlunoDAO');

const alunoDAO = require('../dao/AlunoDAO');
const alunoService = require('./AlunoService');

describe('AlunoService.criarAluno', () => {
    beforeEach(() => jest.clearAllMocks());

    it('lança erro quando nome está ausente', async () => {
        await expect(alunoService.criarAluno(undefined, '12345678901', new Date())).rejects.toThrow('Nome e CPF são obrigatórios.');
        expect(alunoDAO.criar).not.toHaveBeenCalled();
    });

    it('lança erro quando cpf está ausente', async () => {
        await expect(alunoService.criarAluno('Fulano', undefined, new Date())).rejects.toThrow('Nome e CPF são obrigatórios.');
        expect(alunoDAO.criar).not.toHaveBeenCalled();
    });

    it('lança erro quando cpf tem formato inválido', async () => {
        await expect(alunoService.criarAluno('Fulano', '123', new Date())).rejects.toThrow('Formato de CPF inválido');
        expect(alunoDAO.criar).not.toHaveBeenCalled();
    });

    it('limpa a pontuação do cpf antes de persistir', async () => {
        alunoDAO.criar.mockResolvedValue({ id_aluno: 1, nome: 'Fulano', cpf: '12345678901' });
        const data = new Date();

        await alunoService.criarAluno('Fulano', '123.456.789-01', data);

        expect(alunoDAO.criar).toHaveBeenCalledWith({ nome: 'Fulano', cpf: '12345678901', datamatricula: data });
    });
});

describe('AlunoService.atualizarAluno', () => {
    beforeEach(() => jest.clearAllMocks());

    it('não mexe no cpf quando ele não é enviado na atualização', async () => {
        alunoDAO.atualizar.mockResolvedValue({ id_aluno: 1, nome: 'Novo Nome' });

        await alunoService.atualizarAluno(1, { nome: 'Novo Nome' });

        expect(alunoDAO.atualizar).toHaveBeenCalledWith(1, { nome: 'Novo Nome' });
    });

    it('limpa e valida o cpf quando ele é enviado na atualização', async () => {
        alunoDAO.atualizar.mockResolvedValue({ id_aluno: 1, cpf: '98765432100' });

        await alunoService.atualizarAluno(1, { cpf: '987.654.321-00' });

        expect(alunoDAO.atualizar).toHaveBeenCalledWith(1, { cpf: '98765432100' });
    });

    it('lança erro quando o cpf enviado na atualização é inválido', async () => {
        await expect(alunoService.atualizarAluno(1, { cpf: '123' })).rejects.toThrow('Formato de CPF inválido');
        expect(alunoDAO.atualizar).not.toHaveBeenCalled();
    });
});

describe('AlunoService.buscarAluno', () => {
    beforeEach(() => jest.clearAllMocks());

    it('lança erro quando o aluno não existe', async () => {
        alunoDAO.buscarPorId.mockResolvedValue(null);
        await expect(alunoService.buscarAluno(999)).rejects.toThrow('Aluno não encontrado.');
    });

    it('retorna o aluno quando ele existe', async () => {
        const aluno = { id_aluno: 1, nome: 'Fulano' };
        alunoDAO.buscarPorId.mockResolvedValue(aluno);
        await expect(alunoService.buscarAluno(1)).resolves.toEqual(aluno);
    });
});

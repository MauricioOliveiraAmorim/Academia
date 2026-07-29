jest.mock('../dao/PlanoExercicioDAO');

const planoExercicioDAO = require('../dao/PlanoExercicioDAO');
const planoExercicioService = require('./PlanoExercicioService');

beforeEach(() => jest.clearAllMocks());

describe('PlanoExercicioService.criarPlanoExercicio', () => {
    it('lança erro quando id_planotreino está ausente', async () => {
        await expect(planoExercicioService.criarPlanoExercicio(undefined, 1, 3, 10, 20, null))
            .rejects.toThrow('Plano e Exercício são obrigatórios.');
        expect(planoExercicioDAO.criar).not.toHaveBeenCalled();
    });

    it('lança erro quando id_exercicio está ausente', async () => {
        await expect(planoExercicioService.criarPlanoExercicio(1, undefined, 3, 10, 20, null))
            .rejects.toThrow('Plano e Exercício são obrigatórios.');
    });

    it('lança erro quando series/repeticoes/carga não são números válidos', async () => {
        await expect(planoExercicioService.criarPlanoExercicio(1, 1, 'abc', 10, 20, null))
            .rejects.toThrow('Séries, repetições e carga devem ser números válidos.');
        expect(planoExercicioDAO.criar).not.toHaveBeenCalled();
    });

    it('converte descanso em formato "HH:MM:SS" para Date', async () => {
        planoExercicioDAO.criar.mockResolvedValue({ id_planoexercicio: 1 });

        await planoExercicioService.criarPlanoExercicio(1, 1, 3, 10, 20, '00:01:30');

        const dados = planoExercicioDAO.criar.mock.calls[0][0];
        expect(dados.descanso).toBeInstanceOf(Date);
        expect(dados.descanso.getUTCMinutes()).toBe(1);
        expect(dados.descanso.getUTCSeconds()).toBe(30);
    });

    it('converte descanso em segundos (número) para Date', async () => {
        planoExercicioDAO.criar.mockResolvedValue({ id_planoexercicio: 1 });

        await planoExercicioService.criarPlanoExercicio(1, 1, 3, 10, 20, 90);

        const dados = planoExercicioDAO.criar.mock.calls[0][0];
        expect(dados.descanso.getUTCMinutes()).toBe(1);
        expect(dados.descanso.getUTCSeconds()).toBe(30);
    });

    it('usa descanso null quando não é informado', async () => {
        planoExercicioDAO.criar.mockResolvedValue({ id_planoexercicio: 1 });

        await planoExercicioService.criarPlanoExercicio(1, 1, 3, 10, 20, undefined);

        const dados = planoExercicioDAO.criar.mock.calls[0][0];
        expect(dados.descanso).toBeNull();
    });

    it('normaliza ids, series, repeticoes e carga para inteiros', async () => {
        planoExercicioDAO.criar.mockResolvedValue({ id_planoexercicio: 1 });

        await planoExercicioService.criarPlanoExercicio('1', '2', '3', '10', '20', null);

        expect(planoExercicioDAO.criar).toHaveBeenCalledWith({
            id_planotreino: 1,
            id_exercicio: 2,
            series: 3,
            repeticoes: 10,
            carga: 20,
            descanso: null
        });
    });
});

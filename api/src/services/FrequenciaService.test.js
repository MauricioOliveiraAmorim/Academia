jest.mock('../dao/FrequenciaDAO');

const frequenciaDAO = require('../dao/FrequenciaDAO');
const frequenciaService = require('./FrequenciaService');

beforeEach(() => jest.clearAllMocks());

describe('FrequenciaService.registrarFrequencia', () => {
    it('lança erro quando id_aluno está ausente', async () => {
        await expect(frequenciaService.registrarFrequencia(undefined, '2026-01-01', 'Presente'))
            .rejects.toThrow('Aluno, Data e Status são obrigatórios.');
        expect(frequenciaDAO.criar).not.toHaveBeenCalled();
    });

    it('lança erro quando dia está ausente', async () => {
        await expect(frequenciaService.registrarFrequencia(1, undefined, 'Presente'))
            .rejects.toThrow('Aluno, Data e Status são obrigatórios.');
    });

    it('lança erro para status de presença desconhecido', async () => {
        await expect(frequenciaService.registrarFrequencia(1, '2026-01-01', 'Atrasado'))
            .rejects.toThrow("Status inválido. Use 'Presente' ou 'Falta'.");
        expect(frequenciaDAO.criar).not.toHaveBeenCalled();
    });

    it('normaliza "Presença" para o enum "Presente"', async () => {
        frequenciaDAO.criar.mockResolvedValue({ id_frequencia: 1 });

        await frequenciaService.registrarFrequencia(1, '2026-01-01', 'Presença');

        expect(frequenciaDAO.criar).toHaveBeenCalledWith(expect.objectContaining({
            id_aluno: 1,
            presenca: 'Presente'
        }));
    });

    it('aceita "Falta" e converte id_aluno/dia corretamente', async () => {
        frequenciaDAO.criar.mockResolvedValue({ id_frequencia: 1 });

        await frequenciaService.registrarFrequencia('7', '2026-03-15', 'Falta');

        const chamada = frequenciaDAO.criar.mock.calls[0][0];
        expect(chamada.id_aluno).toBe(7);
        expect(chamada.presenca).toBe('Falta');
        expect(chamada.dia).toBeInstanceOf(Date);
    });
});

describe('FrequenciaService.atualizarFrequencia', () => {
    it('lança erro quando falta o id', async () => {
        await expect(frequenciaService.atualizarFrequencia(undefined, 'Presente'))
            .rejects.toThrow('ID e Status são obrigatórios.');
    });

    it('lança erro quando falta o status', async () => {
        await expect(frequenciaService.atualizarFrequencia(1, undefined))
            .rejects.toThrow('ID e Status são obrigatórios.');
    });

    it('repassa id e presença para o DAO', async () => {
        frequenciaDAO.atualizar.mockResolvedValue({ id_frequencia: 1, presenca: 'Falta' });

        await frequenciaService.atualizarFrequencia(1, 'Falta');

        expect(frequenciaDAO.atualizar).toHaveBeenCalledWith(1, { presenca: 'Falta' });
    });
});

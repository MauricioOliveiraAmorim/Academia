const { prismaErrorResponse } = require('./prismaErrorResponse');

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('prismaErrorResponse', () => {
    it('mapeia P2025 para 404', () => {
        const res = mockRes();
        prismaErrorResponse(res, { code: 'P2025' }, 'fallback');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Registro não encontrado.' });
    });

    it('mapeia P2002 para 409', () => {
        const res = mockRes();
        prismaErrorResponse(res, { code: 'P2002' }, 'fallback');
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: 'Já existe um registro com esse valor único.' });
    });

    it('mapeia P2003 para 400', () => {
        const res = mockRes();
        prismaErrorResponse(res, { code: 'P2003' }, 'fallback');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Operação inválida: existe um registro relacionado que impede essa ação.' });
    });

    it('usa a mensagem e status de fallback para erros desconhecidos', () => {
        const res = mockRes();
        prismaErrorResponse(res, { code: 'P9999' }, 'Erro genérico');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro genérico' });
    });

    it('respeita o status de fallback customizado', () => {
        const res = mockRes();
        prismaErrorResponse(res, new Error('validação falhou'), 'validação falhou', 400);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'validação falhou' });
    });
});

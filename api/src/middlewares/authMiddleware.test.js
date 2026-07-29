const jwt = require('jsonwebtoken');
const { autenticar, autorizar } = require('./authMiddleware');

function mockReqRes(authHeader) {
    const req = { headers: authHeader ? { authorization: authHeader } : {} };
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    const next = jest.fn();
    return { req, res, next };
}

describe('autenticar', () => {
    const originalSecret = process.env.JWT_SECRET;

    beforeAll(() => {
        process.env.JWT_SECRET = 'segredo-de-teste';
    });

    afterAll(() => {
        process.env.JWT_SECRET = originalSecret;
    });

    it('rejeita quando não há header Authorization', () => {
        const { req, res, next } = mockReqRes(undefined);
        autenticar(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejeita quando o header não começa com "Bearer "', () => {
        const { req, res, next } = mockReqRes('Token abc123');
        autenticar(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejeita token inválido/expirado', () => {
        const { req, res, next } = mockReqRes('Bearer token-invalido');
        autenticar(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('aceita token válido e popula req.user', () => {
        const token = jwt.sign({ id: 1, tipo: 'Aluno', email: 'a@a.com' }, process.env.JWT_SECRET);
        const { req, res, next } = mockReqRes(`Bearer ${token}`);
        autenticar(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toMatchObject({ id: 1, tipo: 'Aluno', email: 'a@a.com' });
    });
});

describe('autorizar', () => {
    it('bloqueia quando req.user não está definido', () => {
        const { req, res, next } = mockReqRes();
        autorizar('Instrutor')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('bloqueia quando o tipo do usuário não está na lista permitida', () => {
        const { req, res, next } = mockReqRes();
        req.user = { tipo: 'Aluno' };
        autorizar('Instrutor')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('permite quando o tipo do usuário está na lista permitida', () => {
        const { req, res, next } = mockReqRes();
        req.user = { tipo: 'Instrutor' };
        autorizar('Instrutor')(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('aceita múltiplos tipos permitidos', () => {
        const { req, res, next } = mockReqRes();
        req.user = { tipo: 'Aluno' };
        autorizar('Aluno', 'Instrutor')(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});

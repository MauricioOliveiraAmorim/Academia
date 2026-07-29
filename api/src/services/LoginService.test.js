jest.mock('../dao/LoginDAO');
jest.mock('../prismaClient', () => ({
    login: { findUnique: jest.fn() },
    aluno: { findUnique: jest.fn() },
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const loginDAO = require('../dao/LoginDAO');
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const loginService = require('./LoginService');

const originalSecret = process.env.JWT_SECRET;

beforeAll(() => {
    process.env.JWT_SECRET = 'segredo-de-teste';
});

afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('LoginService.registrarNovoUsuario', () => {
    it('lança erro quando falta um campo básico', async () => {
        await expect(loginService.registrarNovoUsuario({ nome: 'Fulano' })).rejects.toThrow('são obrigatórios');
        expect(loginDAO.registrar).not.toHaveBeenCalled();
    });

    it('lança erro quando o e-mail já está registrado', async () => {
        prisma.login.findUnique.mockResolvedValue({ id_login: 1, email: 'a@a.com' });

        await expect(loginService.registrarNovoUsuario({
            nome: 'Fulano', email: 'a@a.com', senha: '123456', tipo: 'Aluno', cpf: '12345678901'
        })).rejects.toThrow('Este e-mail já está registrado em nosso sistema.');

        expect(loginDAO.registrar).not.toHaveBeenCalled();
    });

    it('lança erro quando aluno não informa cpf', async () => {
        prisma.login.findUnique.mockResolvedValue(null);

        await expect(loginService.registrarNovoUsuario({
            nome: 'Fulano', email: 'a@a.com', senha: '123456', tipo: 'Aluno'
        })).rejects.toThrow('CPF é obrigatório para Aluno.');
    });

    it('lança erro quando o cpf do aluno tem formato inválido', async () => {
        prisma.login.findUnique.mockResolvedValue(null);

        await expect(loginService.registrarNovoUsuario({
            nome: 'Fulano', email: 'a@a.com', senha: '123456', tipo: 'Aluno', cpf: '123'
        })).rejects.toThrow('Formato de CPF inválido');
    });

    it('lança erro quando o cpf já pertence a outro aluno', async () => {
        prisma.login.findUnique.mockResolvedValue(null);
        prisma.aluno.findUnique.mockResolvedValue({ id_aluno: 5 });

        await expect(loginService.registrarNovoUsuario({
            nome: 'Fulano', email: 'a@a.com', senha: '123456', tipo: 'Aluno', cpf: '123.456.789-01'
        })).rejects.toThrow('Este CPF já está associado a outro aluno.');
    });

    it('lança erro quando instrutor não informa especialidade', async () => {
        prisma.login.findUnique.mockResolvedValue(null);

        await expect(loginService.registrarNovoUsuario({
            nome: 'Fulano', email: 'a@a.com', senha: '123456', tipo: 'Instrutor'
        })).rejects.toThrow('Especialidade é obrigatória para Instrutor.');
    });

    it('lança erro para tipo de perfil não suportado', async () => {
        prisma.login.findUnique.mockResolvedValue(null);

        await expect(loginService.registrarNovoUsuario({
            nome: 'Fulano', email: 'a@a.com', senha: '123456', tipo: 'Admin'
        })).rejects.toThrow('Tipo de perfil não suportado.');
    });

    it('registra um aluno com sucesso, faz hash da senha, emite token e não devolve o hash', async () => {
        prisma.login.findUnique.mockResolvedValue(null);
        prisma.aluno.findUnique.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hash-fake');
        jwt.sign.mockReturnValue('token-fake');
        loginDAO.registrar.mockResolvedValue({
            perfil: { id_aluno: 1, nome: 'Fulano', cpf: '12345678901' },
            novoLogin: { id_login: 1, email: 'a@a.com', senha: 'hash-fake', tipousuario: 'Aluno', referencia: 1 }
        });

        const resultado = await loginService.registrarNovoUsuario({
            nome: 'Fulano', email: 'a@a.com', senha: 'minhaSenha', tipo: 'Aluno', cpf: '123.456.789-01'
        });

        expect(bcrypt.hash).toHaveBeenCalledWith('minhaSenha', 10);
        expect(loginDAO.registrar).toHaveBeenCalledWith(
            'aluno',
            expect.objectContaining({ nome: 'Fulano', cpf: '12345678901' }),
            expect.objectContaining({ email: 'a@a.com', senha: 'hash-fake', tipousuario: 'Aluno' })
        );
        expect(resultado.novoLogin).not.toHaveProperty('senha');
        expect(resultado.novoLogin.email).toBe('a@a.com');
        expect(resultado.token).toBe('token-fake');
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: 1, tipo: 'Aluno', email: 'a@a.com' },
            'segredo-de-teste',
            { expiresIn: '8h' }
        );
    });

    it('registra um instrutor sem exigir cpf e emite token', async () => {
        prisma.login.findUnique.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hash-fake');
        jwt.sign.mockReturnValue('token-fake');
        loginDAO.registrar.mockResolvedValue({
            perfil: { id_instrutor: 1, nome: 'Fulano', especialidade: 'Funcional' },
            novoLogin: { id_login: 2, email: 'b@b.com', senha: 'hash-fake', tipousuario: 'Instrutor', referencia: 1 }
        });

        const resultado = await loginService.registrarNovoUsuario({
            nome: 'Fulano', email: 'b@b.com', senha: 'minhaSenha', tipo: 'Instrutor', especialidade: 'Funcional'
        });

        expect(prisma.aluno.findUnique).not.toHaveBeenCalled();
        expect(loginDAO.registrar).toHaveBeenCalledWith(
            'instrutor',
            { nome: 'Fulano', especialidade: 'Funcional' },
            expect.objectContaining({ email: 'b@b.com' })
        );
        expect(resultado.novoLogin).not.toHaveProperty('senha');
        expect(resultado.token).toBe('token-fake');
    });
});

describe('LoginService.autenticar', () => {
    it('lança erro quando o e-mail não existe', async () => {
        prisma.login.findUnique.mockResolvedValue(null);
        await expect(loginService.autenticar('a@a.com', '123456')).rejects.toThrow('E-mail não encontrado.');
    });

    it('lança erro quando a senha está incorreta', async () => {
        prisma.login.findUnique.mockResolvedValue({ email: 'a@a.com', senha: 'hash', referencia: 1, tipousuario: 'Aluno' });
        bcrypt.compare.mockResolvedValue(false);

        await expect(loginService.autenticar('a@a.com', 'errada')).rejects.toThrow('Senha incorreta.');
    });

    it('retorna id, tipo e token quando as credenciais são válidas', async () => {
        prisma.login.findUnique.mockResolvedValue({ email: 'a@a.com', senha: 'hash', referencia: 7, tipousuario: 'Instrutor' });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('token-fake');

        const resultado = await loginService.autenticar('a@a.com', 'correta');

        expect(jwt.sign).toHaveBeenCalledWith(
            { id: 7, tipo: 'Instrutor', email: 'a@a.com' },
            'segredo-de-teste',
            { expiresIn: '8h' }
        );
        expect(resultado).toEqual({
            mensagem: 'Login efetuado com sucesso.',
            id: 7,
            tipo: 'Instrutor',
            token: 'token-fake'
        });
    });
});

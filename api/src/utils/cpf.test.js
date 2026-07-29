const { cleanAndValidateCpf } = require('./cpf');

describe('cleanAndValidateCpf', () => {
    it('retorna null quando o cpf não é informado', () => {
        expect(cleanAndValidateCpf(null)).toBeNull();
        expect(cleanAndValidateCpf(undefined)).toBeNull();
        expect(cleanAndValidateCpf('')).toBeNull();
    });

    it('remove pontuação e retorna só os dígitos', () => {
        expect(cleanAndValidateCpf('123.456.789-01')).toBe('12345678901');
    });

    it('aceita cpf já limpo com 11 dígitos', () => {
        expect(cleanAndValidateCpf('12345678901')).toBe('12345678901');
    });

    it('lança erro para cpf com menos de 11 dígitos', () => {
        expect(() => cleanAndValidateCpf('123456789')).toThrow('Formato de CPF inválido. O CPF deve conter 11 dígitos.');
    });

    it('lança erro para cpf com mais de 11 dígitos', () => {
        expect(() => cleanAndValidateCpf('123456789012')).toThrow('Formato de CPF inválido. O CPF deve conter 11 dígitos.');
    });

    it('ignora letras e outros caracteres não numéricos ao contar dígitos', () => {
        expect(() => cleanAndValidateCpf('abc123')).toThrow();
    });
});

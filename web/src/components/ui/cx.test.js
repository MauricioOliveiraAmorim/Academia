import { describe, it, expect } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
    it('junta classes truthy com espaço', () => {
        expect(cx('a', 'b', 'c')).toBe('a b c');
    });

    it('ignora valores falsy', () => {
        expect(cx('a', false, null, undefined, 0, '', 'b')).toBe('a b');
    });

    it('retorna string vazia quando nada é truthy', () => {
        expect(cx(false, null, undefined)).toBe('');
    });

    it('lida com um único argumento', () => {
        expect(cx('sozinho')).toBe('sozinho');
    });
});

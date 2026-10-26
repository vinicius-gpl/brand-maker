import { describe, expect, it } from 'vitest';
import { initials, splitTagline } from './preview-sample.ts';

describe('splitTagline', () => {
	it('highlights the last word and keeps the punctuation after it', () => {
		// feliz
		expect(splitTagline('Feito com cuidado, do jeito certo.')).toEqual({
			before: 'Feito com cuidado, do jeito ',
			highlight: 'certo',
			after: '.'
		});
	});

	it('handles accents and a single word', () => {
		expect(splitTagline('Ação!')).toEqual({ before: '', highlight: 'Ação', after: '!' });
	});

	it('returns the text untouched when there is no word', () => {
		// triste
		expect(splitTagline('...')).toEqual({ before: '...', highlight: '', after: '' });
	});
});

describe('initials', () => {
	it('uses the first and last meaningful words', () => {
		expect(initials('Café do Zé')).toBe('CZ');
		expect(initials('Minha Marca')).toBe('MM');
	});

	it('works with one word and empty names', () => {
		expect(initials('Aurora')).toBe('A');
		expect(initials('')).toBe('');
	});
});

describe('initials edge cases', () => {
	it('falls back to short words when nothing else is left', () => {
		expect(initials('de da')).toBe('dd');
		expect(initials('   ')).toBe('');
	});
});

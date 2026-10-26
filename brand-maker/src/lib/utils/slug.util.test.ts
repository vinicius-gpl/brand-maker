import { describe, expect, it } from 'vitest';
import { DEFAULT_SLUG, slugify } from './slug.util.ts';

describe('slugify', () => {
	it('lowercases, strips accents and joins with hyphens', () => {
		// feliz
		expect(slugify('Café do Zé')).toBe('cafe-do-ze');
		expect(slugify('  Ação & Reação 2  ')).toBe('acao-reacao-2');
	});

	it('falls back when nothing usable is left', () => {
		// triste
		expect(slugify('')).toBe(DEFAULT_SLUG);
		expect(slugify('★★★')).toBe(DEFAULT_SLUG);
	});
});

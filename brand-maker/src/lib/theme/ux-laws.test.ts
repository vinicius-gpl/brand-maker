import { describe, expect, it } from 'vitest';
import { defaultLawSettings, renderPractice, UX_LAWS } from './ux-laws.ts';

describe('ux-laws', () => {
	it('fills each placeholder with its configured value', () => {
		// feliz
		expect(renderPractice('Alvo de {{minTargetPx}}px', { minTargetPx: 48 })).toBe('Alvo de 48px');
	});

	it('keeps a placeholder that has no value', () => {
		// triste: parâmetro desconhecido não some em silêncio
		expect(renderPractice('Até {{faltando}} itens', {})).toBe('Até {{faltando}} itens');
	});

	it('starts every law enabled with its default limits', () => {
		const settings = defaultLawSettings();
		for (const law of UX_LAWS) {
			expect(settings[law.id].enabled).toBe(true);
			for (const param of law.params)
				expect(settings[law.id].params[param.key]).toBe(param.default);
		}
	});

	it('only uses placeholders that exist as params', () => {
		for (const law of UX_LAWS) {
			const keys = law.params.map((p) => p.key);
			for (const practice of law.practices) {
				for (const [, key] of practice.matchAll(/\{\{(\w+)\}\}/g)) expect(keys).toContain(key);
			}
		}
	});
});

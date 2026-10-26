import { describe, expect, it } from 'vitest';
import { PALETTE_GROUPS } from '#lib/theme/palettes.ts';
import { NEUTRALS, STATUS_COLORS } from '#lib/theme/foundation.ts';
import { isPureExtreme } from './color.util.ts';
import { buildTokens, checkBrandRules, contrastReport, MODES, wcagLevel } from './tokens.util.ts';

const palettes = PALETTE_GROUPS.flatMap((group) => group.palettes);

const combinations = palettes.flatMap((palette) =>
	NEUTRALS.flatMap((neutral) => MODES.map((mode) => ({ palette, neutral, mode })))
);

describe('tokens.util', () => {
	it('starts from data without pure black or white', () => {
		const values = [
			...NEUTRALS.flatMap((n) => [...Object.values(n.dark), ...Object.values(n.light)]),
			...Object.values(STATUS_COLORS).flatMap((s) => Object.values(s))
		];
		expect(values.filter(isPureExtreme)).toEqual([]);
	});

	it.each(combinations)(
		'respects the brand rules: $palette.id / $neutral.id / $mode',
		({ palette, neutral, mode }) => {
			// feliz: nenhuma combinação do catálogo quebra a regra
			const tokens = buildTokens(palette, mode, neutral);
			expect(Object.entries(tokens).filter(([, hex]) => isPureExtreme(hex))).toEqual([]);
			const failing = contrastReport(tokens).filter((row) => row.ratio < row.min);
			expect(failing.map((row) => row.label)).toEqual([]);
		}
	);

	it('flags a purple primary as common', () => {
		// triste
		const mauve = {
			id: 'mauve',
			name: 'Mauve',
			primary: '#cba6f7',
			accent: '#f5c2e7',
			tertiary: '#74c7ec'
		};
		const hueRule = checkBrandRules(mauve, NEUTRALS[0]).at(-1);
		expect(hueRule?.ok).toBe(false);
	});

	it('keeps palette ids unique across the catalog', () => {
		const ids = palettes.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('maps contrast ratios to WCAG levels', () => {
		expect(wcagLevel(8)).toBe('AAA');
		expect(wcagLevel(5)).toBe('AA');
		expect(wcagLevel(3.2)).toBe('large');
		expect(wcagLevel(1.5)).toBe('fail');
	});
});

describe('checkBrandRules edge cases', () => {
	const base = { id: 'x', name: 'x', accent: '#9fe3c4', tertiary: '#f7d794' };

	it('flags a blue primary as common', () => {
		// triste
		const rule = checkBrandRules({ ...base, primary: '#3b82f6' }, NEUTRALS[0]).at(-1);
		expect(rule).toEqual({ ok: false, advisory: true, label: 'Primária azul (comum)' });
	});

	it('does not flag a grayish blue (low saturation)', () => {
		// feliz: titânio é azulado, mas quase cinza
		const rule = checkBrandRules({ ...base, primary: '#aeb8c4' }, NEUTRALS[0]).at(-1);
		expect(rule?.ok).toBe(true);
	});

	it('reports pure white in the palette', () => {
		// triste
		const rule = checkBrandRules({ ...base, primary: '#ffffff' }, NEUTRALS[0])[0];
		expect(rule).toEqual({ ok: false, label: 'Tem preto/branco puro' });
	});
});

describe('checkBrandRules with a broken neutral scale', () => {
	it('counts the contrast failures', () => {
		// triste: texto secundário igual ao cartão nunca passa
		const broken = {
			...NEUTRALS[0],
			dark: { ...NEUTRALS[0].dark, 'muted-foreground': NEUTRALS[0].dark.card },
			light: { ...NEUTRALS[0].light, 'muted-foreground': NEUTRALS[0].light.card }
		};
		const palette = {
			id: 'x',
			name: 'x',
			primary: '#f2b84b',
			accent: '#4fb3a9',
			tertiary: '#e07a5f'
		};
		expect(checkBrandRules(palette, broken)[1]).toEqual({
			ok: false,
			label: '2 contraste(s) abaixo do AA'
		});
	});
});

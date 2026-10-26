import { describe, expect, it } from 'vitest';
import { NEUTRALS } from '#lib/theme/foundation.ts';
import { hueOf } from './color.util.ts';
import { HARMONIES, harmonize, randomPalette } from './harmony.util.ts';
import { checkBrandRules } from './tokens.util.ts';

/** Gerador determinístico (LCG) para os testes não dependerem da sorte. */
function seeded(seed: number) {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 2 ** 32;
		return state / 2 ** 32;
	};
}

const hueDistance = (a: string, b: string) => {
	const d = Math.abs(hueOf(a).hue - hueOf(b).hue) % 360;
	return Math.min(d, 360 - d);
};

describe('harmonize', () => {
	it('keeps the primary and rotates the others by the harmony offsets', () => {
		// feliz
		const primary = '#e2725b';
		for (const harmony of HARMONIES) {
			const colors = harmonize(primary, harmony.id);
			expect(colors.primary).toBe(primary);
			const expected = Math.min(
				Math.abs(harmony.offsets[0]) % 360,
				360 - (Math.abs(harmony.offsets[0]) % 360)
			);
			expect(hueDistance(primary, colors.accent)).toBeCloseTo(expected, -1);
		}
	});

	it('falls back to the complementary harmony for an unknown id', () => {
		// triste
		expect(harmonize('#e2725b', 'inexistente' as never)).toEqual(
			harmonize('#e2725b', 'complementar')
		);
	});

	it('pulls a dull base into the vivid identity range', () => {
		// triste: um cinza escuro não vira destaque cinza escuro
		const { accent } = harmonize('#333333', 'complementar');
		expect(hueOf(accent).saturation).toBeGreaterThanOrEqual(0.44);
		expect(accent).not.toBe('#333333');
	});
});

describe('randomPalette', () => {
	it('never picks a blue or purple primary', () => {
		const random = seeded(42);
		for (let i = 0; i < 200; i++) {
			const { hue } = hueOf(randomPalette(random).primary);
			expect(hue >= 200 && hue < 300).toBe(false);
		}
	});

	it('produces palettes that pass every brand rule', () => {
		// feliz: o sorteio já sai dentro da regra (contraste e sem preto/branco puro)
		const random = seeded(7);
		for (let i = 0; i < 400; i++) {
			const colors = randomPalette(random);
			const palette = { id: 'x', name: 'x', ...colors };
			for (const neutral of NEUTRALS) {
				expect(checkBrandRules(palette, neutral).every((rule) => rule.ok)).toBe(true);
			}
		}
	});
});

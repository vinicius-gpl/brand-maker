import { describe, expect, it } from 'vitest';
import { contrast, fitContrast, hexToRgb, isPureExtreme, mix, rgbToHex } from './color.util.ts';

describe('color.util', () => {
	it('converts hex to rgb and back', () => {
		// feliz
		expect(hexToRgb('#f2b84b')).toEqual([242, 184, 75]);
		expect(rgbToHex([242, 184, 75])).toBe('#f2b84b');
	});

	it('clamps out-of-range channels', () => {
		// triste
		expect(rgbToHex([300, -10, 128])).toBe('#ff0080');
	});

	it('computes WCAG contrast', () => {
		expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0);
		expect(contrast('#777777', '#777777')).toBe(1);
	});

	it('keeps a color that already passes', () => {
		// feliz
		expect(fitContrast('#f1f5f9', '#11111a', 4.5)).toBe('#f1f5f9');
	});

	it('darkens a pastel until it passes on a light background', () => {
		// triste: o limão pastel não passa sobre o fundo claro
		const fitted = fitContrast('#e6f28c', '#f5f6fa', 4.5);
		expect(contrast(fitted, '#f5f6fa')).toBeGreaterThanOrEqual(4.5);
	});

	it('mixes with weight 0 and 1 returning the sources', () => {
		expect(mix('#ff0000', '#0000ff', 1)).toBe('#ff0000');
		expect(mix('#ff0000', '#0000ff', 0)).toBe('#0000ff');
	});

	it('flags pure black and white only', () => {
		expect(isPureExtreme('#ffffff')).toBe(true);
		expect(isPureExtreme('#000000')).toBe(true);
		expect(isPureExtreme('#fbfbfd')).toBe(false);
		expect(isPureExtreme('#11111a')).toBe(false);
	});
});

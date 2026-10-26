import { describe, expect, it } from 'vitest';
import {
	DEFAULT_PATTERN,
	PATTERNS,
	patternById,
	patternTokens,
	patternVars,
	toStyle
} from './patterns.ts';

describe('patterns', () => {
	it('has unique ids and starts from the house pattern', () => {
		const ids = PATTERNS.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(patternById(DEFAULT_PATTERN).name).toBe('Simples');
	});

	it('falls back to the house pattern for an unknown id', () => {
		// triste
		expect(patternById('nao-existe').id).toBe('simples');
	});

	it('keeps every control at 40px or more (Lei de Fitts)', () => {
		for (const pattern of PATTERNS)
			expect(parseInt(pattern.controlHeight), pattern.id).toBeGreaterThanOrEqual(40);
	});

	it('never uses pure black or white, not even in shadows', () => {
		for (const pattern of PATTERNS) {
			const css = JSON.stringify(pattern);
			expect(css, pattern.id).not.toMatch(/#000|#fff|rgba?\(0, ?0, ?0|\bblack\b|\bwhite\b/i);
		}
	});

	it('credits only real sources and has rules for every pattern', () => {
		for (const pattern of PATTERNS) {
			expect(pattern.rules.length, pattern.id).toBeGreaterThan(2);
			if (pattern.inspiredBy) expect(pattern.inspiredBy.url).toMatch(/^https:\/\//);
		}
	});

	it('exports role-named tokens and derives the preview variables', () => {
		// feliz
		const material = patternById('material');
		expect(patternTokens(material)).toMatchObject({
			'shape-button': '9999px',
			'card-border-color': 'transparent'
		});
		const vars = patternVars(material);
		expect(vars['--pv-shape-card']).toBe('28px');
		expect(vars['--pv-input-border-width']).toBe('0 0 1px 0');
		expect(vars['--pv-input-bg']).toBe('var(--color-muted)');
		expect(patternVars(patternById('simples'))['--pv-input-border-width']).toBe('1px');
	});

	it('points the focus color to the warning token for GOV.UK', () => {
		expect(patternTokens(patternById('govuk'))['focus-color']).toBe('var(--color-warning)');
		expect(patternTokens(patternById('fluent'))['focus-color']).toBe('var(--color-ring)');
	});

	it('serializes variables as a style attribute', () => {
		expect(toStyle({ '--a': '1px', '--b': 'red' })).toBe('--a: 1px; --b: red');
	});
});

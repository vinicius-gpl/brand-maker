import { afterEach, describe, expect, it } from 'vitest';
import { motionMs, prefersReducedMotion } from './motion.util.ts';

const setReducedMotion = (reduce: boolean) => {
	window.matchMedia = ((query: string) => ({
		matches: reduce && query.includes('reduce')
	})) as typeof window.matchMedia;
};

describe('motion.util', () => {
	afterEach(() => setReducedMotion(true));

	it('keeps the duration when motion is allowed', () => {
		// feliz
		setReducedMotion(false);
		expect(prefersReducedMotion()).toBe(false);
		expect(motionMs(260)).toBe(260);
	});

	it('drops to zero when the person asked for reduced motion', () => {
		// triste
		setReducedMotion(true);
		expect(prefersReducedMotion()).toBe(true);
		expect(motionMs(260)).toBe(0);
	});
});

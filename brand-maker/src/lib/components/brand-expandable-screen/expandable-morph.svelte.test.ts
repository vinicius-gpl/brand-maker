import { afterEach, describe, expect, it } from 'vitest';
import { morph } from './expandable-morph.ts';

function originAt(rect: { left: number; top: number; width: number; height: number }) {
	const element = document.createElement('div');
	element.getBoundingClientRect = () =>
		({
			...rect,
			right: rect.left + rect.width,
			bottom: rect.top + rect.height,
			x: rect.left,
			y: rect.top
		}) as DOMRect;
	return element;
}

const setReducedMotion = (reduce: boolean) => {
	window.matchMedia = ((query: string) => ({
		matches: reduce && query.includes('reduce')
	})) as typeof window.matchMedia;
};

describe('morph', () => {
	const node = document.createElement('div');
	afterEach(() => setReducedMotion(true));

	it('starts at the trigger box and ends full screen', () => {
		// feliz
		setReducedMotion(false);
		Object.assign(window, { innerWidth: 1000, innerHeight: 800 });
		const config = morph(node, {
			origin: originAt({ left: 300, top: 200, width: 500, height: 400 }),
			fromRadius: '16px',
			toRadius: '0px',
			duration: 0.5
		});
		expect(config.duration).toBe(500);

		const start = config.css!(0, 1);
		expect(start).toContain('translate(300px, 200px) scale(0.5)');
		expect(start).toContain('opacity: 0');
		// No começo só a altura do gatilho aparece: 400px na tela = 800px na escala 0.5.
		expect(start).toContain('calc(100% - 800px)');

		const end = config.css!(1, 0);
		expect(end).toContain('translate(0px, 0px) scale(1)');
		expect(end).toContain('opacity: 1');
	});

	it('fades in during the first quarter only', () => {
		setReducedMotion(false);
		Object.assign(window, { innerWidth: 1000, innerHeight: 800 });
		const config = morph(node, {
			origin: originAt({ left: 0, top: 0, width: 500, height: 400 }),
			fromRadius: '16px',
			toRadius: '0px',
			duration: 0.5
		});
		expect(config.css!(0.125, 0.875)).toContain('opacity: 0.5');
		expect(config.css!(0.5, 0.5)).toContain('opacity: 1');
	});

	it('skips the animation without an origin or with reduced motion', () => {
		// triste
		setReducedMotion(false);
		expect(
			morph(node, { origin: null, fromRadius: '0px', toRadius: '0px', duration: 0.5 })
		).toEqual({ duration: 0 });
		setReducedMotion(true);
		const origin = originAt({ left: 0, top: 0, width: 10, height: 10 });
		expect(morph(node, { origin, fromRadius: '0px', toRadius: '0px', duration: 0.5 })).toEqual({
			duration: 0
		});
	});
});

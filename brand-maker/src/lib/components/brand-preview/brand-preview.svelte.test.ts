import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PATTERNS, patternById } from '#lib/theme/patterns.ts';
import type { Brand } from '#lib/types/design.type.ts';
import BrandPreview from './brand-preview.svelte';

const brand: Brand = {
	name: 'Café do Zé',
	slug: 'cafe-do-ze',
	tagline: 'Café coado, do jeito certo.',
	description: 'Cafeteria de bairro.',
	logo: null
};

describe('BrandPreview', () => {
	it('shows the brand text with the last word of the tagline highlighted', () => {
		const { container } = render(BrandPreview, {
			data: { brand, pattern: PATTERNS[0], styleId: 'neon' }
		});
		expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
			'Café coado, do jeito certo.'
		);
		expect(container.querySelector('.pv-title mark')).toHaveTextContent('certo');
		expect(screen.getByText('Cafeteria de bairro.')).toBeInTheDocument();
		expect(screen.getByText('https://cafe-do-ze.exemplo.com')).toBeInTheDocument();
		expect(container.querySelector('.pv')).toHaveAttribute('data-style', 'neon');
	});

	it('uses the initials when there is no logo, and the logo when there is one', () => {
		const { container, rerender } = render(BrandPreview, {
			data: { brand, pattern: PATTERNS[0], styleId: 'none' }
		});
		expect(container.querySelector('.pv-wordmark-tag')).toHaveTextContent('CZ');
		rerender({
			data: {
				brand: { ...brand, logo: 'data:image/svg+xml;base64,PHN2Zy8+' },
				pattern: PATTERNS[0],
				styleId: 'none'
			}
		});
		expect(container.querySelector('.pv-wordmark-logo')).toBeInTheDocument();
	});

	it('applies the pattern as --pv-* variables', () => {
		const { container } = render(BrandPreview, {
			data: { brand, pattern: patternById('material'), styleId: 'none' }
		});
		const pv = container.querySelector<HTMLElement>('.pv')!;
		expect(pv).toHaveAttribute('data-pattern', 'material');
		expect(pv.style.getPropertyValue('--pv-shape-button')).toBe('9999px');
		expect(pv.style.getPropertyValue('--pv-input-border-width')).toBe('0 0 1px 0');
	});

	it('offers fullscreen only when the page provides it', async () => {
		// feliz
		const onFullscreen = vi.fn();
		render(BrandPreview, {
			data: { brand, pattern: PATTERNS[0], styleId: 'none' },
			actions: { onFullscreen }
		});
		await userEvent.click(screen.getByRole('button', { name: /Tela cheia/ }));
		expect(onFullscreen).toHaveBeenCalledOnce();
	});

	it('drops the browser frame in chromeless mode', () => {
		// triste: em tela cheia não há moldura nem botão de tela cheia
		render(BrandPreview, {
			data: { brand, pattern: PATTERNS[0], styleId: 'none' },
			ui: { chrome: false },
			actions: { onFullscreen: () => {} }
		});
		expect(screen.queryByText('https://cafe-do-ze.exemplo.com')).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Tela cheia/ })).not.toBeInTheDocument();
	});
});

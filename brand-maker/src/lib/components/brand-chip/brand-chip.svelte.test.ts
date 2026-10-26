import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { textSnippet } from '../../../../tests/snippet.ts';
import BrandChip from './brand-chip.svelte';

describe('BrandChip', () => {
	it('exposes the pressed state and reports clicks', async () => {
		// feliz
		const onClick = vi.fn();
		render(BrandChip, {
			state: { pressed: true },
			actions: { onClick },
			children: textSnippet('Neon')
		});
		const chip = screen.getByRole('button', { name: 'Neon' });
		expect(chip).toHaveAttribute('aria-pressed', 'true');
		await userEvent.click(chip);
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('is not pressed by default styling and merges extra classes', () => {
		// triste: classe de fora não pode duplicar nem perder a altura mínima
		render(BrandChip, {
			ui: { className: 'snap-start' },
			state: { pressed: false },
			actions: { onClick: () => {} },
			children: textSnippet('Flat')
		});
		const chip = screen.getByRole('button', { name: 'Flat' });
		expect(chip).toHaveAttribute('aria-pressed', 'false');
		expect(chip).toHaveClass('control', 'snap-start');
		expect(chip).not.toHaveClass('bg-primary');
	});
});

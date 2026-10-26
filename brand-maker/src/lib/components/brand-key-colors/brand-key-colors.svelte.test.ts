import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NEUTRALS } from '#lib/theme/foundation.ts';
import { buildTokens } from '#lib/utils/tokens.util.ts';
import BrandKeyColors from './brand-key-colors.svelte';

const palette = {
	id: 'ambar',
	name: 'Âmbar',
	primary: '#f2b84b',
	accent: '#4fb3a9',
	tertiary: '#e07a5f'
};
const dark = buildTokens(palette, 'dark', NEUTRALS[0]);
const light = buildTokens(palette, 'light', NEUTRALS[0]);

describe('BrandKeyColors', () => {
	it('shows the three identity colors in both modes with their text tone', () => {
		render(BrandKeyColors, { data: { dark, light }, actions: { onCopy: () => {} } });
		for (const label of ['Primária', 'Destaque', 'Terceira'])
			expect(screen.getByText(label)).toBeInTheDocument();
		expect(
			screen.getByText(`texto: ${dark['primary-strong']} / ${light['primary-strong']}`)
		).toBeInTheDocument();
	});

	it('copies the clicked hex', async () => {
		// feliz
		const onCopy = vi.fn();
		render(BrandKeyColors, { data: { dark, light }, actions: { onCopy } });
		await userEvent.click(screen.getAllByRole('button', { name: `Copiar ${dark.primary}` })[0]);
		expect(onCopy).toHaveBeenCalledWith(dark.primary);
	});

	it('paints each cell with readable label color', () => {
		// triste: rótulo ilegível sobre a própria cor
		render(BrandKeyColors, { data: { dark, light }, actions: { onCopy: () => {} } });
		const cell = screen.getAllByRole('button', { name: `Copiar ${dark.primary}` })[0];
		expect(cell.style.background).not.toBe('');
		expect(cell.style.color).not.toBe(cell.style.background);
	});
});

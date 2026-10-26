import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BrandFullscreenBar from './brand-fullscreen-bar.svelte';

function setup() {
	const actions = { onMode: vi.fn(), onClose: vi.fn() };
	render(BrandFullscreenBar, {
		data: {
			brandName: 'Aurora',
			paletteLabel: 'Opala · Iridescente',
			patternName: 'Carbon',
			mode: 'dark'
		},
		actions
	});
	return actions;
}

describe('BrandFullscreenBar', () => {
	it('shows what is being previewed', () => {
		setup();
		expect(screen.getByText('Aurora')).toBeInTheDocument();
		expect(screen.getByText('Opala · Iridescente')).toBeInTheDocument();
		expect(screen.getByText('Carbon')).toBeInTheDocument();
	});

	it('switches mode and closes', async () => {
		// feliz
		const actions = setup();
		await userEvent.click(screen.getByRole('button', { name: /Claro/ }));
		expect(actions.onMode).toHaveBeenCalledWith('light');
		await userEvent.click(screen.getByRole('button', { name: /Fechar/ }));
		expect(actions.onClose).toHaveBeenCalledOnce();
	});

	it('keeps the close button in the flow, never floating over the mode switch', () => {
		// triste: o fechar já ficou por cima do seletor de modo
		setup();
		expect(screen.getByRole('button', { name: /Fechar/ })).not.toHaveClass('fixed', 'absolute');
	});
});

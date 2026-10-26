import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Moon } from '@lucide/svelte';
import BrandSegmented from './brand-segmented.svelte';

const options = [
	{ value: 'dark', label: 'Escuro', icon: Moon },
	{ value: 'light', label: 'Claro' }
];

describe('BrandSegmented', () => {
	it('marks only the current option as pressed', () => {
		render(BrandSegmented, {
			data: { options, value: 'dark' },
			ui: { label: 'Modo' },
			actions: { onSelect: () => {} }
		});
		expect(screen.getByRole('group', { name: 'Modo' })).toBeInTheDocument();
		const dark = screen.getByRole('button', { name: 'Escuro' });
		expect(dark).toHaveAttribute('aria-pressed', 'true');
		// O ícone é decorativo: não entra no nome acessível.
		expect(dark.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
		expect(screen.getByRole('button', { name: 'Claro' })).toHaveAttribute('aria-pressed', 'false');
	});

	it('reports the chosen value', async () => {
		// feliz
		const onSelect = vi.fn();
		render(BrandSegmented, {
			data: { options, value: 'dark' },
			ui: { label: 'Modo' },
			actions: { onSelect }
		});
		await userEvent.click(screen.getByRole('button', { name: 'Claro' }));
		expect(onSelect).toHaveBeenCalledWith('light');
	});
});

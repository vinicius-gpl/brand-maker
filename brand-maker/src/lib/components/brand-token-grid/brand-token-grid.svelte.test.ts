import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BrandTokenGrid from './brand-token-grid.svelte';

const tokens = { background: '#11111a', primary: '#f2b84b', 'muted-foreground': '#94a3b8' };

describe('BrandTokenGrid', () => {
	it('lists every token with its CSS variable name', () => {
		render(BrandTokenGrid, { data: { tokens }, actions: { onCopy: () => {} } });
		expect(screen.getAllByRole('listitem')).toHaveLength(3);
		expect(screen.getByText('--muted-foreground')).toBeInTheDocument();
	});

	it('copies the hex of the clicked token', async () => {
		// feliz
		const onCopy = vi.fn();
		render(BrandTokenGrid, { data: { tokens }, actions: { onCopy } });
		await userEvent.click(screen.getByRole('button', { name: 'Copiar primary: #f2b84b' }));
		expect(onCopy).toHaveBeenCalledWith('#f2b84b');
	});

	it('renders nothing for an empty token set', () => {
		// triste
		render(BrandTokenGrid, { data: { tokens: {} }, actions: { onCopy: () => {} } });
		expect(screen.queryAllByRole('listitem')).toHaveLength(0);
	});
});

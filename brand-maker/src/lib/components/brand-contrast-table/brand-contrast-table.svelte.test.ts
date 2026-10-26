import { render, screen, within } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import BrandContrastTable from './brand-contrast-table.svelte';

const tokens = { foreground: '#f1f5f9', background: '#11111a', muted: '#555555' };

describe('BrandContrastTable', () => {
	it('shows the ratio and the WCAG level of each pair', () => {
		render(BrandContrastTable, {
			data: {
				tokens,
				rows: [
					{ label: 'Texto no fundo', fg: 'foreground', bg: 'background', min: 4.5, ratio: 17.2 },
					{ label: 'Texto apagado', fg: 'muted', bg: 'background', min: 4.5, ratio: 2.4 }
				]
			}
		});
		const [, good, bad] = screen.getAllByRole('row');
		// feliz
		expect(within(good).getByText('17.20')).toBeInTheDocument();
		expect(within(good).getByText('AAA')).toBeInTheDocument();
		// triste
		expect(within(bad).getByText('falha')).toHaveClass('text-destructive');
	});
});

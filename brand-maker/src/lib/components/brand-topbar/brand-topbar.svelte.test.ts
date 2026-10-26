import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { chooseOption } from '../../../../tests/select.ts';
import BrandTopbar from './brand-topbar.svelte';

function setup(rules = [{ ok: true, label: 'Contraste AA ok' }]) {
	const actions = { onMode: vi.fn(), onNeutral: vi.fn(), onFont: vi.fn() };
	render(BrandTopbar, {
		data: {
			mode: 'dark',
			neutralId: 'tinta',
			fontId: 'pattern',
			patternFontName: 'Roboto Flex',
			rules
		},
		actions
	});
	return actions;
}

describe('BrandTopbar', () => {
	it('switches mode, neutrals and font', async () => {
		// feliz
		const actions = setup();
		await userEvent.click(screen.getByRole('button', { name: /Claro/ }));
		expect(actions.onMode).toHaveBeenCalledWith('light');
		await chooseOption('Neutros', 'Quente (marrom)');
		expect(actions.onNeutral).toHaveBeenCalledWith('quente');
		await chooseOption('Tipografia', 'DM Sans + Noto Serif');
		expect(actions.onFont).toHaveBeenCalledWith('dm');
	});

	it('keeps pattern, finish and color out of the top bar (they live in the bottom sheet)', () => {
		// triste
		setup();
		expect(screen.queryByRole('combobox', { name: 'Acabamento' })).not.toBeInTheDocument();
	});

	it('offers the font recommended by the pattern first', () => {
		setup();
		expect(screen.getByRole('combobox', { name: 'Tipografia' })).toHaveTextContent(
			'Fonte: Do padrão (Roboto Flex)'
		);
	});

	it('flags a broken brand rule', () => {
		// triste
		setup([
			{ ok: true, label: 'Sem preto/branco puro' },
			{ ok: false, label: 'Primária roxa (comum)' }
		]);
		const rules = screen.getByRole('list', { name: 'Regras da marca' });
		const broken = within(rules).getByText('Primária roxa (comum)').closest('li')!;
		expect(broken).toHaveClass('border-destructive');
		expect(within(broken).getByLabelText('violada')).toBeInTheDocument();
	});
});

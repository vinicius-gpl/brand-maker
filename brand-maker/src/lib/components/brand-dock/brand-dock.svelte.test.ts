import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NEUTRALS, STYLES } from '#lib/theme/foundation.ts';
import { PALETTE_GROUPS } from '#lib/theme/palettes.ts';
import { PATTERNS } from '#lib/theme/patterns.ts';
import BrandDock, { type BrandDockTab } from './brand-dock.svelte';

const palettes = PALETTE_GROUPS.flatMap((group) => group.palettes.map((p) => ({ ...p, group })));

function setup({ collapsed = false, tab = 'cor' as BrandDockTab } = {}) {
	const actions = {
		onPattern: vi.fn(),
		onStyle: vi.fn(),
		onCategory: vi.fn(),
		onPalette: vi.fn(),
		onStep: vi.fn(),
		onShuffle: vi.fn(),
		onToggle: vi.fn(),
		onTab: vi.fn()
	};
	render(BrandDock, {
		data: {
			groups: PALETTE_GROUPS,
			palettes,
			paletteId: 'ambar',
			category: 'all',
			patternId: 'simples',
			styleId: 'none',
			mode: 'dark',
			neutral: NEUTRALS[0]
		},
		state: { collapsed, tab },
		actions
	});
	return actions;
}

describe('BrandDock', () => {
	it('groups pattern, finish and color as tabs, showing one at a time', () => {
		setup();
		const tabs = screen.getByRole('tablist', { name: 'O que escolher' });
		expect(
			within(tabs)
				.getAllByRole('tab')
				.map((t) => t.textContent?.trim())
		).toEqual(['Padrão', 'Acabamento', 'Cor']);
		expect(screen.getByRole('tab', { name: /Cor/ })).toHaveAttribute('aria-selected', 'true');
		expect(screen.getByRole('group', { name: 'Paletas' })).toBeInTheDocument();
		expect(screen.queryByRole('group', { name: 'Padrão de interface' })).not.toBeInTheDocument();
	});

	it('asks the page to switch tabs', async () => {
		const actions = setup();
		await userEvent.click(screen.getByRole('tab', { name: /Acabamento/ }));
		expect(actions.onTab).toHaveBeenCalledWith('acabamento');
	});

	it('lists every pattern on the pattern tab and reports the choice', async () => {
		// feliz
		const actions = setup({ tab: 'padrao' });
		const patterns = screen.getByRole('group', { name: 'Padrão de interface' });
		expect(within(patterns).getAllByRole('button')).toHaveLength(PATTERNS.length);
		expect(within(patterns).getByRole('button', { name: /Simples/ })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await userEvent.click(within(patterns).getByRole('button', { name: /Material 3 Expressive/ }));
		expect(actions.onPattern).toHaveBeenCalledWith('material');
	});

	it('lists every finish on the finish tab and reports the choice', async () => {
		const actions = setup({ tab: 'acabamento' });
		const finishes = screen.getByRole('group', { name: 'Acabamento' });
		expect(within(finishes).getAllByRole('button')).toHaveLength(STYLES.length);
		await userEvent.click(within(finishes).getByRole('button', { name: /Vidro/ }));
		expect(actions.onStyle).toHaveBeenCalledWith('vidro');
	});

	it('reports category, palette, navigation and shuffle on the color tab', async () => {
		const actions = setup();
		await userEvent.click(
			within(screen.getByRole('group', { name: 'Categoria de cor' })).getByRole('button', {
				name: 'Neon'
			})
		);
		expect(actions.onCategory).toHaveBeenCalledWith('neon');
		await userEvent.click(screen.getByRole('button', { name: /Opala/ }));
		expect(actions.onPalette).toHaveBeenCalledWith('opala');
		await userEvent.click(screen.getByRole('button', { name: 'Próxima paleta' }));
		expect(actions.onStep).toHaveBeenCalledWith(1);
		await userEvent.click(screen.getByRole('button', { name: 'Paleta anterior' }));
		expect(actions.onStep).toHaveBeenCalledWith(-1);
		await userEvent.click(screen.getByRole('button', { name: 'Combinação aleatória' }));
		expect(actions.onShuffle).toHaveBeenCalledOnce();
	});

	it('hides the panels when collapsed and reopens when a tab is chosen', async () => {
		// triste: recolhida, só as abas ficam
		const actions = setup({ collapsed: true });
		expect(screen.queryByRole('group', { name: 'Paletas' })).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Mostrar opções' })).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		await userEvent.click(screen.getByRole('tab', { name: /Padrão/ }));
		expect(actions.onTab).toHaveBeenCalledWith('padrao');
		expect(actions.onToggle).toHaveBeenCalledOnce();
	});
});

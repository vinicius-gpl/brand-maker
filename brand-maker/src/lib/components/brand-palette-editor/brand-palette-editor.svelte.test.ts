import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PALETTE_GROUPS } from '#lib/theme/palettes.ts';
import type { PaletteEntry } from '#lib/types/design.type.ts';
import BrandPaletteEditor from './brand-palette-editor.svelte';

const group = PALETTE_GROUPS[0];
const preset: PaletteEntry = { ...group.palettes[0], group };
const colors = { primary: preset.primary, accent: preset.accent, tertiary: preset.tertiary };

function setup(palette = preset) {
	const actions = { onColor: vi.fn(), onHarmony: vi.fn(), onRandom: vi.fn() };
	render(BrandPaletteEditor, { data: { palette, colors }, actions });
	return actions;
}

describe('BrandPaletteEditor', () => {
	it('shows where the colors came from', () => {
		setup();
		expect(screen.getByText(`${preset.name} · ${group.name}`)).toBeInTheDocument();
	});

	it('labels a hand-made palette as custom', () => {
		setup({
			...preset,
			id: 'custom',
			name: 'Personalizada',
			group: { id: 'custom', name: 'Personalizada', palettes: [] }
		});
		expect(screen.getByText('Personalizada')).toBeInTheDocument();
	});

	it('sends a pasted hex for the right color', async () => {
		// feliz
		const actions = setup();
		const field = screen.getByRole('textbox', { name: 'Destaque' });
		await fireEvent.change(field, { target: { value: ' #12AB34 ' } });
		expect(actions.onColor).toHaveBeenCalledWith('accent', '#12AB34');
	});

	it('sends the native color picker value', async () => {
		const actions = setup();
		await fireEvent.input(screen.getByLabelText('Escolher a cor Primária'), {
			target: { value: '#ff8800' }
		});
		expect(actions.onColor).toHaveBeenCalledWith('primary', '#ff8800');
	});

	it('triggers harmonies and the random palette', async () => {
		const actions = setup();
		await userEvent.click(screen.getByRole('button', { name: 'Tríade' }));
		expect(actions.onHarmony).toHaveBeenCalledWith('triade');
		await userEvent.click(screen.getByRole('button', { name: /Paleta aleatória/ }));
		expect(actions.onRandom).toHaveBeenCalledOnce();
	});

	it('keeps every color field labelled and at least 40px tall', () => {
		// triste: campo sem rótulo ou alvo pequeno quebraria Jakob e Fitts
		setup();
		for (const name of ['Primária', 'Destaque', 'Terceira']) {
			expect(screen.getByRole('textbox', { name })).toHaveClass('control');
		}
	});
});

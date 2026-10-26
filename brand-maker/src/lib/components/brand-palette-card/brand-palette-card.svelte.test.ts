import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NEUTRALS } from '#lib/theme/foundation.ts';
import { PALETTE_GROUPS } from '#lib/theme/palettes.ts';
import { buildTokens } from '#lib/utils/tokens.util.ts';
import BrandPaletteCard from './brand-palette-card.svelte';

const group = PALETTE_GROUPS[0];
const palette = { ...group.palettes[0], group };
const tokens = buildTokens(palette, 'dark', NEUTRALS[0]);

describe('BrandPaletteCard', () => {
	it('names the palette and its group, painting the swatches', () => {
		render(BrandPaletteCard, {
			data: { palette, tokens, neutral: NEUTRALS[0].dark },
			state: { selected: false },
			actions: { onSelect: () => {} }
		});
		const card = screen.getByRole('button', { name: new RegExp(palette.name) });
		expect(card).toHaveTextContent(group.name);
		expect(card).toHaveAttribute('aria-pressed', 'false');
		expect(card.querySelectorAll('i')).toHaveLength(3);
	});

	it('highlights the selected palette and reports clicks', async () => {
		// feliz
		const onSelect = vi.fn();
		render(BrandPaletteCard, {
			data: { palette, tokens, neutral: NEUTRALS[0].dark },
			state: { selected: true },
			actions: { onSelect }
		});
		const card = screen.getByRole('button');
		expect(card).toHaveAttribute('aria-pressed', 'true');
		expect(card).toHaveClass('ring-2');
		await userEvent.click(card);
		expect(onSelect).toHaveBeenCalledWith(palette.id);
	});
});

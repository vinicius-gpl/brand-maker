import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { textSnippet } from '../../../../tests/snippet.ts';
import BrandIconButton from './brand-icon-button.svelte';

describe('BrandIconButton', () => {
	it('is named by its label, not by the icon', async () => {
		// feliz
		const onClick = vi.fn();
		render(BrandIconButton, {
			ui: { label: 'Próxima paleta' },
			actions: { onClick },
			children: textSnippet('›')
		});
		const button = screen.getByRole('button', { name: 'Próxima paleta' });
		expect(button).toHaveClass('size-10');
		await userEvent.click(button);
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('shows the label as a tooltip on hover', async () => {
		render(BrandIconButton, {
			ui: { label: 'Próxima paleta' },
			actions: { onClick: () => {} },
			children: textSnippet('›')
		});
		const button = screen.getByRole('button', { name: 'Próxima paleta' });
		await userEvent.hover(button);
		// O bits-ui marca o gatilho e renderiza o conteúdo num portal (sem role="tooltip").
		await waitFor(() => expect(button).toHaveAttribute('data-state', 'delayed-open'));
		expect(document.querySelector('[data-tooltip-content]')).toHaveTextContent('Próxima paleta');
	});

	it('passes the expanded state for disclosure buttons', () => {
		// triste: sem aria-expanded, quem usa leitor de tela não sabe se recolheu
		render(BrandIconButton, {
			ui: { label: 'Recolher paletas' },
			actions: { onClick: () => {} },
			'aria-expanded': false,
			'aria-controls': 'palette-carousel',
			children: textSnippet('▾')
		});
		const button = screen.getByRole('button', { name: 'Recolher paletas' });
		expect(button).toHaveAttribute('aria-expanded', 'false');
		expect(button).toHaveAttribute('aria-controls', 'palette-carousel');
	});
});

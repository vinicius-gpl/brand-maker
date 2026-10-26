import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { textSnippet } from '../../../../tests/snippet.ts';
import BrandSection from './brand-section.svelte';

describe('BrandSection', () => {
	it('labels the region by its title and renders lead, content and actions', () => {
		// feliz
		render(BrandSection, {
			data: { id: 'cores', title: 'Cores da marca', lead: 'Clique para copiar.' },
			children: textSnippet('Conteúdo'),
			actions: textSnippet('Ação')
		});
		const region = screen.getByRole('region', { name: 'Cores da marca' });
		expect(region).toHaveAttribute('id', 'cores');
		expect(screen.getByText('Clique para copiar.')).toBeInTheDocument();
		expect(screen.getByText('Conteúdo')).toBeInTheDocument();
		expect(screen.getByText('Ação')).toBeInTheDocument();
	});

	it('works without lead and actions', () => {
		// triste
		const { container } = render(BrandSection, {
			data: { id: 'kit', title: 'Kit' },
			children: textSnippet('Só conteúdo')
		});
		expect(container.querySelector('p')).toBeNull();
		expect(screen.getByText('Só conteúdo')).toBeInTheDocument();
	});
});

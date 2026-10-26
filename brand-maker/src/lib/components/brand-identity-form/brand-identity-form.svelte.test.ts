import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_IDENTITY } from '#lib/theme/preview-sample.ts';
import type { BrandIdentity } from '#lib/types/design.type.ts';
import BrandIdentityForm from './brand-identity-form.svelte';

function setup(identity: BrandIdentity = DEFAULT_IDENTITY) {
	const actions = { onChange: vi.fn(), onLogo: vi.fn() };
	render(BrandIdentityForm, { data: { identity, slug: 'minha-marca' }, actions });
	return actions;
}

describe('BrandIdentityForm', () => {
	it('groups the fields and shows the slug', () => {
		setup();
		expect(screen.getByRole('group', { name: 'Identidade' })).toBeInTheDocument();
		expect(screen.getByText('minha-marca')).toBeInTheDocument();
	});

	it('reports each typed field', async () => {
		// feliz
		const actions = setup();
		await fireEvent.input(screen.getByRole('textbox', { name: /Nome da marca/ }), {
			target: { value: 'Aurora' }
		});
		await fireEvent.input(screen.getByRole('textbox', { name: /Slogan/ }), {
			target: { value: 'Luz.' }
		});
		await fireEvent.input(screen.getByRole('textbox', { name: /Descrição curta/ }), {
			target: { value: 'Texto' }
		});
		expect(actions.onChange).toHaveBeenCalledWith('name', 'Aurora');
		expect(actions.onChange).toHaveBeenCalledWith('tagline', 'Luz.');
		expect(actions.onChange).toHaveBeenCalledWith('description', 'Texto');
	});

	it('hands the chosen logo file to the page', async () => {
		const actions = setup();
		const file = new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' });
		await userEvent.upload(screen.getByLabelText(/Logo/), file);
		expect(actions.onLogo).toHaveBeenCalledWith(file);
	});

	it('offers "Remover" only when there is a logo', async () => {
		// triste: sem logo, não há o que remover
		setup();
		expect(screen.queryByRole('button', { name: 'Remover' })).not.toBeInTheDocument();
	});

	it('clears the logo', async () => {
		const actions = setup({ ...DEFAULT_IDENTITY, logo: 'data:image/svg+xml;base64,PHN2Zy8+' });
		expect(screen.getByRole('img', { name: 'Logo atual' })).toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Remover' }));
		expect(actions.onChange).toHaveBeenCalledWith('logo', null);
	});
});

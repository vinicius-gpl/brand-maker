/**
 * Integração da página inteira no jsdom: estado (useDesign), kit (useKit), aviso (useToast) e
 * componentes juntos, como a pessoa usa. Os e2e repetem o essencial no navegador de verdade.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chooseOption } from '../../tests/select.ts';
import { createRawSnippet } from 'svelte';
import Layout from './+layout.svelte';
import { prerender } from './+layout.ts';
import Page from './+page.svelte';

const STORAGE_KEY = 'brand-maker/v1';
const nameField = () => screen.getByRole('textbox', { name: /Nome da marca/ });
const pageDock = () =>
	screen.getAllByRole('complementary', { name: 'Escolha de padrão, acabamento e cor' })[0];

describe('página do Brand Maker', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('style');
	});

	it('is fully prerendered for static hosting', () => {
		expect(prerender).toBe(true);
	});

	it('renders the layout around the page', () => {
		render(Layout, {
			data: {},
			params: {},
			children: createRawSnippet(() => ({ render: () => '<p>filho</p>' }))
		} as never);
		expect(screen.getByText('filho')).toBeInTheDocument();
	});

	it('updates the heading and the kit name as the brand is typed', async () => {
		// feliz
		render(Page);
		await fireEvent.input(nameField(), { target: { value: 'Café do Zé' } });
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Café do Zé');
		expect(
			screen.getByRole('button', { name: 'Baixar cafe-do-ze-design-kit.zip' })
		).toBeInTheDocument();
		await waitFor(() => expect(document.title).toBe('Café do Zé · Brand Maker'));
	});

	it('paints the whole app with the chosen tokens and mode', async () => {
		render(Page);
		const root = document.documentElement;
		await waitFor(() => expect(root.style.getPropertyValue('--primary')).toBe('#f2b84b'));
		await userEvent.click(
			within(screen.getByRole('group', { name: 'Modo' })).getByRole('button', { name: /Claro/ })
		);
		expect(root.dataset.theme).toBe('light');
		await chooseOption('Tipografia', 'DM Sans + Noto Serif');
		await waitFor(() =>
			expect(root.style.getPropertyValue('--brand-font-heading')).toContain('Noto Serif')
		);
	});

	it('saves the choice and restores it on the next visit', async () => {
		const first = render(Page);
		await fireEvent.input(nameField(), { target: { value: 'Aurora' } });
		await userEvent.click(within(pageDock()).getByRole('button', { name: /Opala/ }));
		await waitFor(() =>
			expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).identity.name).toBe('Aurora')
		);
		first.unmount();

		render(Page);
		await waitFor(() => expect(nameField()).toHaveValue('Aurora'));
		expect(screen.getByRole('heading', { level: 1 }).nextElementSibling).toHaveTextContent(
			'Opala · Iridescente'
		);
	});

	it('ignores a corrupted saved state', async () => {
		// triste: localStorage com lixo não pode derrubar a página
		localStorage.setItem(STORAGE_KEY, '{isto não é json');
		render(Page);
		expect(nameField()).toHaveValue('Minha Marca');
	});

	it('accepts a logo and refuses an unsupported file with a message', async () => {
		render(Page);
		const upload = screen.getByLabelText(/^Logo/);
		await userEvent.upload(
			upload,
			new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'logo.svg', { type: 'image/svg+xml' })
		);
		await waitFor(() =>
			expect(screen.getByRole('img', { name: 'Logo atual' })).toBeInTheDocument()
		);

		await userEvent.upload(upload, new File(['oi'], 'logo.txt', { type: 'text/plain' }), {
			applyAccept: false
		});
		await waitFor(() =>
			expect(screen.getByText('Use uma logo em SVG, PNG ou WebP.')).toBeInTheDocument()
		);
	});

	it('copies a token and downloads the kit, confirming each with a message', async () => {
		Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:kit'), revokeObjectURL: vi.fn() });
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		render(Page);

		await userEvent.click(screen.getByRole('button', { name: /^Copiar primary:/ }));
		await waitFor(() => expect(screen.getByText(/copiado$/)).toBeInTheDocument());

		await userEvent.click(
			screen.getByRole('button', { name: 'Baixar minha-marca-design-kit.zip' })
		);
		expect(screen.getByText('minha-marca-design-kit.zip baixado')).toBeInTheDocument();
	});

	it('opens the fullscreen preview with only one control bar, and closes it', async () => {
		render(Page);
		await userEvent.click(screen.getByRole('button', { name: /Tela cheia/ }));
		const dialog = screen.getByRole('dialog', { name: 'Prévia em tela cheia' });
		expect(within(dialog).getByRole('tablist', { name: 'O que escolher' })).toBeInTheDocument();
		expect(
			screen.getAllByRole('complementary', { name: 'Escolha de padrão, acabamento e cor' })
		).toHaveLength(1);

		await userEvent.click(within(dialog).getByRole('button', { name: /Fechar/ }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
		expect(
			screen.getAllByRole('complementary', { name: 'Escolha de padrão, acabamento e cor' })
		).toHaveLength(1);
	});

	it('changes the pattern with the keyboard and the finish in the bottom sheet', async () => {
		const { container } = render(Page);
		const pv = () => container.querySelector('#preview .pv')!;
		await userEvent.keyboard('{ArrowDown}');
		expect(pv().getAttribute('data-pattern')).toBe('material');
		await userEvent.click(within(pageDock()).getByRole('tab', { name: /Acabamento/ }));
		await userEvent.click(within(pageDock()).getByRole('button', { name: /Vidro/ }));
		expect(pv().getAttribute('data-style')).toBe('vidro');
		expect(screen.getByRole('heading', { level: 1 }).nextElementSibling).toHaveTextContent(
			'acabamento Vidro'
		);
	});
});

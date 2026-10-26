import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Harness from './brand-expandable-screen-harness.test.svelte';

const open = async () => {
	await userEvent.click(screen.getByRole('button', { name: 'Tela cheia' }));
	return screen.getByRole('dialog', { name: 'Prévia em tela cheia' });
};

describe('BrandExpandableScreen', () => {
	it('stays closed until the trigger asks to expand', () => {
		render(Harness);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('opens as a modal dialog, locks the page scroll and focuses the close button', async () => {
		// feliz
		const onExpandChange = vi.fn();
		render(Harness, { onExpandChange });
		const dialog = await open();
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(screen.getByText('Conteúdo expandido')).toBeInTheDocument();
		expect(document.documentElement.style.overflow).toBe('hidden');
		expect(screen.getByRole('button', { name: /Fechar/ })).toHaveFocus();
		expect(onExpandChange).toHaveBeenCalledWith(true);
	});

	it('reveals the fullscreen-only parts with the content', async () => {
		render(Harness);
		await open();
		const bar = screen.getByText('Barra da tela cheia');
		expect(bar.parentElement).toHaveClass('sticky', 'top-0');
	});

	it('closes with Escape, unlocks the scroll and gives focus back to the trigger', async () => {
		render(Harness);
		await open();
		await userEvent.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
		expect(document.documentElement.style.overflow).toBe('');
		expect(screen.getByRole('button', { name: 'Tela cheia' })).toHaveFocus();
	});

	it('closes with the close button', async () => {
		render(Harness);
		await open();
		await userEvent.click(screen.getByRole('button', { name: /Fechar/ }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	});

	it('focuses the dialog itself when the close button lives in the content', async () => {
		// triste: sem o botão próprio, o foco não pode ficar perdido na página de trás
		render(Harness, { showCloseButton: false });
		const dialog = await open();
		expect(screen.queryByRole('button', { name: /Fechar/ })).not.toBeInTheDocument();
		expect(dialog).toHaveFocus();
	});
});

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BrandPreviewMotion from './brand-preview-motion.svelte';

describe('BrandPreviewMotion', () => {
	afterEach(() => vi.useRealTimers());

	it('saves with a loading state, confirms and goes back to idle', async () => {
		// feliz
		vi.useFakeTimers();
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		render(BrandPreviewMotion);
		const button = screen.getByRole('button', { name: 'Salvar alterações' });

		await user.click(button);
		expect(button).toHaveTextContent('Salvando…');
		expect(button).toHaveAttribute('aria-busy', 'true');
		expect(screen.getByText('Salvando', { selector: '[aria-live]' })).toBeInTheDocument();

		await vi.advanceTimersByTimeAsync(1600);
		expect(button).toHaveTextContent('Salvo');
		await vi.advanceTimersByTimeAsync(1600);
		expect(button).toHaveTextContent('Salvar alterações');
	});

	it('ignores clicks while it is still saving', async () => {
		// triste: clique duplo não dispara dois salvamentos
		vi.useFakeTimers();
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		render(BrandPreviewMotion);
		const button = screen.getByRole('button', { name: 'Salvar alterações' });
		await user.click(button);
		await user.click(button);
		await vi.advanceTimersByTimeAsync(1600);
		expect(button).toHaveTextContent('Salvo');
	});

	it('exposes progress, loading and the skeleton to assistive technology', () => {
		render(BrandPreviewMotion);
		expect(screen.getByRole('progressbar', { name: 'Enviando arquivos' })).toHaveAttribute(
			'aria-valuenow',
			'64'
		);
		expect(screen.getByRole('progressbar', { name: 'Processando' })).not.toHaveAttribute(
			'aria-valuenow'
		);
		expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument();
		expect(screen.getByLabelText('Conteúdo carregando')).toHaveAttribute('aria-busy', 'true');
	});

	it('toggles the switch', async () => {
		render(BrandPreviewMotion);
		const toggle = screen.getByRole('switch', { name: 'Notificações por e-mail' });
		expect(toggle).toHaveAttribute('aria-checked', 'true');
		await userEvent.click(toggle);
		expect(toggle).toHaveAttribute('aria-checked', 'false');
	});

	it('moves the tab indicator to the chosen period', async () => {
		const { container } = render(BrandPreviewMotion);
		await userEvent.click(screen.getByRole('button', { name: 'Ano' }));
		expect(screen.getByRole('button', { name: 'Ano' })).toHaveAttribute('aria-pressed', 'true');
		expect(
			container.querySelector<HTMLElement>('.pv-tabs')!.style.getPropertyValue('--active')
		).toBe('2');
	});

	it('opens the accordion', async () => {
		const { container } = render(BrandPreviewMotion);
		const details = container.querySelector('details')!;
		await userEvent.click(screen.getByText('Como funciona a cobrança?'));
		expect(details.open).toBe(true);
	});
});

import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import BrandToast from './brand-toast.svelte';

describe('BrandToast', () => {
	it('announces the message politely when visible', () => {
		// feliz
		render(BrandToast, { data: { message: 'Kit baixado' }, state: { visible: true } });
		const toast = screen.getByRole('status');
		expect(toast).toHaveAttribute('aria-live', 'polite');
		expect(toast).toHaveTextContent('Kit baixado');
		expect(toast).toHaveClass('opacity-100');
	});

	it('stays transparent when hidden', () => {
		// triste
		render(BrandToast, { data: { message: '' }, state: { visible: false } });
		expect(screen.getByRole('status')).toHaveClass('opacity-0');
		expect(screen.getByRole('status')).not.toHaveClass('opacity-100');
	});
});

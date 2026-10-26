import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Harness from './brand-tooltip-harness.test.svelte';

describe('BrandTooltip', () => {
	it('opens on keyboard focus too, not only on hover', async () => {
		// feliz: quem navega por Tab também vê o texto
		render(Harness);
		const trigger = screen.getByRole('button', { name: 'Gatilho' });
		trigger.focus();
		await waitFor(() => expect(trigger.getAttribute('data-state')).toMatch(/open/));
		expect(document.querySelector('[data-tooltip-content]')).toHaveTextContent('Explicação');
	});

	it('stays closed until the trigger is hovered or focused', () => {
		// triste
		render(Harness);
		expect(screen.getByRole('button', { name: 'Gatilho' })).toHaveAttribute('data-state', 'closed');
		expect(document.querySelector('[data-tooltip-content]')).toBeNull();
	});

	it('closes with Escape', async () => {
		render(Harness);
		const trigger = screen.getByRole('button', { name: 'Gatilho' });
		trigger.focus();
		await waitFor(() => expect(trigger.getAttribute('data-state')).toMatch(/open/));
		await userEvent.keyboard('{Escape}');
		await waitFor(() => expect(trigger).toHaveAttribute('data-state', 'closed'));
	});
});

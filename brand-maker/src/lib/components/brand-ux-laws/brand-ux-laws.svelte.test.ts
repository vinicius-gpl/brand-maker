import { fireEvent, render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { defaultLawSettings, UX_LAWS } from '#lib/theme/ux-laws.ts';
import BrandUxLaws from './brand-ux-laws.svelte';

function setup(settings = defaultLawSettings()) {
	const actions = { onToggle: vi.fn(), onParam: vi.fn() };
	render(BrandUxLaws, { data: { settings }, actions });
	return actions;
}

const card = (name: string) => screen.getByRole('heading', { name }).closest('li')!;

describe('BrandUxLaws', () => {
	it('renders all seven laws with their configured limits', () => {
		setup();
		expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(UX_LAWS.length);
		expect(within(card('Lei de Fitts')).getByText(/pelo menos 40px/)).toBeInTheDocument();
	});

	it('reports toggling a law', async () => {
		// feliz
		const actions = setup();
		await userEvent.click(within(card('Lei de Hick')).getByRole('checkbox'));
		expect(actions.onToggle).toHaveBeenCalledWith('hick');
	});

	it('reports a new limit from the slider', async () => {
		const actions = setup();
		await fireEvent.input(within(card('Lei de Fitts')).getByRole('slider'), {
			target: { value: '48' }
		});
		expect(actions.onParam).toHaveBeenCalledWith('fitts', 'minTargetPx', 48);
	});

	it('disables the limits of a law that is off', () => {
		// triste
		const settings = defaultLawSettings();
		settings.miller.enabled = false;
		setup(settings);
		const miller = card('Lei de Miller');
		expect(within(miller).getByText('Desligada')).toBeInTheDocument();
		expect(within(miller).getByRole('slider')).toBeDisabled();
	});
});

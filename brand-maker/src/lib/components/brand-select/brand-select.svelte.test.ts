import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { chooseOption, findOption } from '../../../../tests/select.ts';
import BrandSelect from './brand-select.svelte';

const options = [
	{ value: 'tinta', label: 'Tinta azulada' },
	{ value: 'quente', label: 'Quente (marrom)' }
];

function setup(onChange = vi.fn(), className?: string) {
	render(BrandSelect, {
		data: { options, value: 'tinta' },
		ui: { label: 'Neutros', prefix: 'Neutro: ', className },
		actions: { onChange }
	});
	return onChange;
}

describe('BrandSelect', () => {
	it('shows the prefix and the current label on a named trigger', () => {
		setup();
		const trigger = screen.getByRole('combobox', { name: 'Neutros' });
		expect(trigger).toHaveTextContent('Neutro: Tinta azulada');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('opens a styled listbox, marks the current option and reports the choice', async () => {
		// feliz
		const onChange = setup();
		await userEvent.click(screen.getByRole('combobox', { name: 'Neutros' }));
		expect(screen.getByRole('combobox', { name: 'Neutros' })).toHaveAttribute(
			'aria-expanded',
			'true'
		);
		expect(await findOption('Tinta azulada')).toHaveAttribute('aria-selected', 'true');
		await userEvent.click(await findOption('Quente (marrom)'));
		expect(onChange).toHaveBeenCalledWith('quente');
	});

	it('works with the helper used by other tests', async () => {
		const onChange = setup();
		await chooseOption('Neutros', 'Quente (marrom)');
		expect(onChange).toHaveBeenCalledWith('quente');
	});

	it('lets an explicit height from outside replace the default one', () => {
		// triste: sem o merge, `control` e `h-8` ficariam juntos e brigariam
		setup(vi.fn(), 'w-full h-8');
		const trigger = screen.getByRole('combobox', { name: 'Neutros' });
		expect(trigger).toHaveClass('w-full', 'h-8');
		expect(trigger).not.toHaveClass('control');
	});
});

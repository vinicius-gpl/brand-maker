/**
 * Escolhe uma opção num BrandSelect (bits-ui) como uma pessoa: abre a lista e clica.
 *
 * `hidden: true`: o bits-ui só torna a lista visível depois de medir onde posicioná-la, e o
 * jsdom não tem layout, então ela fica com `visibility: hidden`. A visibilidade de verdade é
 * conferida nos e2e (Chrome).
 */
import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

/** Opção pelo texto: em elemento invisível o nome acessível calculado vem vazio. */
export async function findOption(name: string | RegExp): Promise<HTMLElement> {
	const options = await screen.findAllByRole('option', { hidden: true });
	const match = options.find((o) =>
		typeof name === 'string' ? o.textContent?.trim() === name : name.test(o.textContent ?? '')
	);
	if (!match)
		throw new Error(
			`Opção não encontrada: ${name}. Opções: ${options.map((o) => o.textContent?.trim()).join(', ')}`
		);
	return match;
}

export async function chooseOption(label: string, option: string | RegExp) {
	await userEvent.click(screen.getByRole('combobox', { name: label }));
	await userEvent.click(await findOption(option));
}

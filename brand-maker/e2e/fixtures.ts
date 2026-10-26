/**
 * Base dos e2e: toda página começa limpa (sem escolha salva) e o teste falha se aparecer erro
 * no console ou exceção não tratada.
 */
import { test as base, expect, type Page } from '@playwright/test';

export const test = base.extend<{ consoleErrors: string[] }>({
	// Automático: vale para todo teste, sem precisar pedir.
	consoleErrors: [
		async ({ page }, use) => {
			const errors: string[] = [];
			page.on('console', (message) => {
				if (message.type() === 'error') errors.push(message.text());
			});
			page.on('pageerror', (error) => errors.push(error.message));
			await use(errors);
			expect(errors, 'erros no console').toEqual([]);
		},
		{ auto: true }
	]
});

export { expect };

/**
 * Abre o app do zero e espera a hidratação. O HTML pré-renderizado já mostra tudo (e o campo já
 * é editável), mas os botões só respondem depois que o Svelte hidrata; o sinal confiável é o
 * tema aplicado no <html> pelo estado da página, que só existe depois disso.
 */
export async function openApp(page: Page) {
	await page.goto('/');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await expect
		.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--primary')))
		.not.toBe('');
}

export const editor = (page: Page) => page.getByRole('complementary', { name: 'Editor da marca' });
export const dock = (page: Page) =>
	page.getByRole('complementary', { name: 'Escolha de padrão, acabamento e cor' });
export const preview = (page: Page) => page.locator('#preview .pv');

/** Escolhe uma opção num select próprio (bits-ui): abre a lista e clica na opção visível. */
export async function choose(page: Page, label: string, option: string | RegExp) {
	await page.getByRole('combobox', { name: label }).click();
	await page.getByRole('option', { name: option }).click();
}

type Root = Page | import('@playwright/test').Locator;

/** Abre uma aba do bottom sheet (Padrão, Acabamento ou Cor). */
export async function openTab(root: Root, name: 'Padrão' | 'Acabamento' | 'Cor') {
	await root.getByRole('tablist', { name: 'O que escolher' }).getByRole('tab', { name }).click();
}

/** Escolhe um padrão no bottom sheet (ou no da tela cheia, passando o diálogo como raiz). */
export async function pickPattern(root: Root, name: string | RegExp) {
	await openTab(root, 'Padrão');
	await root
		.getByRole('group', { name: 'Padrão de interface' })
		.getByRole('button', { name })
		.click();
}

/** Escolhe um acabamento no bottom sheet. */
export async function pickFinish(root: Root, name: string | RegExp) {
	await openTab(root, 'Acabamento');
	await root.getByRole('group', { name: 'Acabamento' }).getByRole('button', { name }).click();
}

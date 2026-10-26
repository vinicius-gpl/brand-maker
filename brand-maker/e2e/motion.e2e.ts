/** Os exemplos com movimento da prévia, no navegador de verdade. */
import { expect, openApp, pickPattern, test } from './fixtures.ts';

test.describe('prévia com movimento', () => {
	test.beforeEach(async ({ page }) => openApp(page));

	const pv = (page: import('@playwright/test').Page) => page.locator('#preview .pv');

	test('spinner e esqueleto animam, e param com "reduzir movimento"', async ({ page }) => {
		const spinner = pv(page).locator('.pv-spinner');
		expect(await spinner.evaluate((el) => getComputedStyle(el).animationName)).toBe('spin');
		expect(
			await pv(page)
				.locator('.pv-skeleton')
				.first()
				.evaluate((el) => getComputedStyle(el).animationName)
		).toBe('pulse');

		await page.emulateMedia({ reducedMotion: 'reduce' });
		expect(await spinner.evaluate((el) => getComputedStyle(el).animationDuration)).toBe('0s');
	});

	test('salvar mostra carregando, confirma e volta', async ({ page }) => {
		// O nome muda com o estado; o localizador precisa achar o botão em qualquer um deles.
		const button = pv(page).getByRole('button', { name: /Salvar alterações|Salvando|Salvo/ });
		await button.click();
		await expect(button).toHaveText(/Salvando/);
		await expect(button).toHaveText(/Salvo/, { timeout: 3000 });
		await expect(button).toHaveText('Salvar alterações', { timeout: 3000 });
	});

	test('switch, abas e acordeão respondem no tempo e na curva do padrão', async ({ page }) => {
		await pickPattern(page, /Material 3 Expressive/);
		const toggle = pv(page).getByRole('switch', { name: 'Notificações por e-mail' });
		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-checked', 'false');
		// A transição do switch usa a mola do Material (passa do ponto e volta).
		expect(
			await toggle.locator('span').evaluate((el) => getComputedStyle(el).transitionTimingFunction)
		).toContain('cubic-bezier(0.42, 1.67');

		await pv(page).getByRole('button', { name: 'Ano' }).click();
		await expect(pv(page).getByRole('button', { name: 'Ano' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);

		await pv(page).getByText('Como funciona a cobrança?').click();
		await expect(pv(page).getByText('Você paga só pelo que usar')).toBeVisible();
	});

	test('o alvo do switch tem 40px mesmo com o trilho menor (Lei de Fitts)', async ({ page }) => {
		const box = (await pv(page).getByRole('switch').boundingBox())!;
		expect(box.height).toBeGreaterThanOrEqual(40);
	});
});

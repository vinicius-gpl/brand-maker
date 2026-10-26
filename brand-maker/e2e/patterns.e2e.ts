/**
 * Os padrões medidos no navegador de verdade: o que a prévia calcula de raio, altura, borda,
 * sombra e foco tem que bater com o que o padrão promete (e com o que o kit exporta).
 */
import { expect, openApp, openTab, pickFinish, pickPattern, preview, test } from './fixtures.ts';

const computed = (page: import('@playwright/test').Page, selector: string, property: string) =>
	page
		.locator(`#preview ${selector}`)
		.first()
		.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

test.describe('padrões de interface', () => {
	// Sem transição: mede o valor final, não um quadro no meio da animação de borda.
	test.beforeEach(async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await openApp(page);
	});

	test('Material 3 Expressive: botão em pílula, cartão sem borda e campo só com a linha de baixo', async ({
		page
	}) => {
		await pickPattern(page, /Material 3 Expressive/);
		await expect(preview(page)).toHaveAttribute('data-pattern', 'material');
		expect(
			parseFloat(await computed(page, '.pv-btn--primary', 'border-top-left-radius'))
		).toBeGreaterThan(100);
		expect(await computed(page, '.pv-card', 'border-top-left-radius')).toBe('28px');
		expect(await computed(page, '.pv-card', 'border-top-color')).toBe('rgba(0, 0, 0, 0)');
		expect(await computed(page, '.pv-input', 'border-top-width')).toBe('0px');
		expect(await computed(page, '.pv-input', 'border-bottom-width')).toBe('1px');
		expect(await computed(page, 'h3', 'font-family')).toContain('Roboto Flex');
	});

	test('Carbon: cantos retos, botões de 48px e tags em pílula', async ({ page }) => {
		await pickPattern(page, /Carbon/);
		expect(await computed(page, '.pv-btn--primary', 'border-top-left-radius')).toBe('0px');
		expect(await computed(page, '.pv-btn--primary', 'height')).toBe('48px');
		expect(parseFloat(await computed(page, '.pv-badge', 'border-top-left-radius'))).toBeGreaterThan(
			100
		);
	});

	test('Fluent 2: cantos de 4px e sombra em camadas no cartão', async ({ page }) => {
		await pickPattern(page, /Fluent 2/);
		expect(await computed(page, '.pv-btn--primary', 'border-top-left-radius')).toBe('4px');
		expect(await computed(page, '.pv-card', 'box-shadow')).toMatch(/,/);
	});

	test('GOV.UK: links sempre sublinhados e foco que pinta o fundo na cor de aviso', async ({
		page
	}) => {
		await pickPattern(page, /GOV\.UK/);
		expect(await computed(page, '.pv-link', 'text-decoration-line')).toBe('underline');
		// :focus-visible só acende com teclado: chega ao link com Tab a partir do botão anterior.
		await page.locator('#preview .pv-card--form .pv-btn').first().focus();
		await page.keyboard.press('Tab');
		await expect(page.locator('#preview .pv-link')).toBeFocused();
		const [background, warning] = await page.evaluate(() => [
			getComputedStyle(document.querySelector('#preview .pv-link')!).backgroundColor,
			getComputedStyle(document.documentElement).getPropertyValue('--warning').trim()
		]);
		expect(background).not.toBe('rgba(0, 0, 0, 0)');
		expect(warning).toMatch(/^#/);
	});

	test('todo padrão mantém os controles da prévia com 40px ou mais', async ({ page }) => {
		await openTab(page, 'Padrão');
		const group = page.getByRole('group', { name: 'Padrão de interface' });
		const names = await group.getByRole('button').allTextContents();
		expect(names.length).toBe(10);
		for (const name of names) {
			await group.getByRole('button', { name: name.trim() }).click();
			const height = parseFloat(await computed(page, '.pv-btn--primary', 'height'));
			expect(height, name).toBeGreaterThanOrEqual(40);
		}
	});

	test('o acabamento não muda a forma do padrão', async ({ page }) => {
		await pickPattern(page, /Carbon/);
		await pickFinish(page, /Suave/);
		expect(await computed(page, '.pv-btn--primary', 'border-top-left-radius')).toBe('0px');
	});
});

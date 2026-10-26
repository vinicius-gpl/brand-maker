import { expect, openApp, test } from './fixtures.ts';

/** Roda no desktop e no celular (projeto `mobile` do playwright.config). */
test.describe('layout', () => {
	test.beforeEach(async ({ page }) => openApp(page));

	test('não cria rolagem horizontal', async ({ page }) => {
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow).toBe(0);
	});

	test('todo controle tem nome acessível e no mínimo 40px de altura (Lei de Fitts)', async ({
		page
	}) => {
		// A prévia (.pv) é o site de exemplo, não a interface da ferramenta.
		const controls = page.locator(
			':is(button, select, input:not([type=checkbox], [type=range], [type=file])):not(.pv *):visible'
		);
		const count = await controls.count();
		expect(count).toBeGreaterThan(20);
		for (let i = 0; i < count; i++) {
			const control = controls.nth(i);
			await expect(control).toHaveAccessibleName(/\S/);
			const box = (await control.boundingBox())!;
			expect(
				box.height,
				await control.evaluate((el) => el.outerHTML.slice(0, 120))
			).toBeGreaterThanOrEqual(40);
		}
	});

	test('o conteúdo não fica escondido atrás da barra de baixo', async ({ page }) => {
		await page.getByRole('button', { name: /Baixar/ }).scrollIntoViewIfNeeded();
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		const download = (await page.getByRole('button', { name: /Baixar/ }).boundingBox())!;
		const dockTop = (await page
			.getByRole('complementary', { name: 'Escolha de padrão, acabamento e cor' })
			.boundingBox())!.y;
		const listBottom = (await page.getByRole('list', { name: 'Arquivos do kit' }).boundingBox())!;
		expect(download.y + download.height).toBeLessThanOrEqual(dockTop);
		expect(listBottom.y + listBottom.height).toBeLessThanOrEqual(dockTop + 1);
	});
});

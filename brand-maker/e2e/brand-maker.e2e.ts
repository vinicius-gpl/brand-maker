import { fileURLToPath } from 'node:url';
import {
	choose,
	dock,
	editor,
	expect,
	openApp,
	pickFinish,
	pickPattern,
	preview,
	test
} from './fixtures.ts';

const LOGO = fileURLToPath(new URL('./assets/logo.svg', import.meta.url));

test.describe('criar uma marca', () => {
	test.beforeEach(async ({ page }) => openApp(page));

	test('a identidade digitada aparece na prévia e vira o nome dos arquivos', async ({ page }) => {
		await page.getByRole('textbox', { name: /Nome da marca/ }).fill('Café do Zé');
		await page.getByRole('textbox', { name: /Slogan/ }).fill('Café coado, do jeito certo.');
		await page.getByRole('textbox', { name: /Descrição curta/ }).fill('Cafeteria de bairro.');

		await expect(editor(page).getByText('cafe-do-ze')).toBeVisible();
		await expect(page).toHaveTitle('Café do Zé · Brand Maker');
		await expect(preview(page).locator('.pv-title mark')).toHaveText('certo');
		await expect(preview(page).getByText('Cafeteria de bairro.')).toBeVisible();
		await expect(preview(page).locator('.pv-wordmark-tag')).toHaveText('CZ');
	});

	test('a logo enviada substitui o monograma', async ({ page }) => {
		await page.getByLabel(/^Logo/).setInputFiles(LOGO);
		await expect(editor(page).getByRole('img', { name: 'Logo atual' })).toBeVisible();
		await expect(preview(page).locator('.pv-wordmark-logo')).toBeVisible();

		await editor(page).getByRole('button', { name: 'Remover' }).click();
		await expect(preview(page).locator('.pv-wordmark-tag')).toBeVisible();
	});

	test('logo em formato não aceito é recusada com aviso', async ({ page }) => {
		await page
			.getByLabel(/^Logo/)
			.setInputFiles({ name: 'logo.txt', mimeType: 'text/plain', buffer: Buffer.from('oi') });
		await expect(
			page.getByRole('status').filter({ hasText: 'Use uma logo em SVG, PNG ou WebP.' })
		).toBeVisible();
		await expect(preview(page).locator('.pv-wordmark-logo')).toHaveCount(0);
	});

	test('escolher, editar e gerar cores', async ({ page }) => {
		const cores = editor(page).getByRole('group', { name: /Cores/ });

		await dock(page)
			.getByRole('group', { name: 'Paletas' })
			.getByRole('button', { name: /Opala/ })
			.click();
		await expect(cores.getByText('Opala · Iridescente')).toBeVisible();
		await expect(cores.getByRole('textbox', { name: 'Primária', exact: true })).toHaveValue(
			'#8ee3d4'
		);

		await cores.getByRole('textbox', { name: 'Primária', exact: true }).fill('#e2725b');
		await cores.getByRole('textbox', { name: 'Primária', exact: true }).press('Enter');
		await expect(page.getByText('Cores personalizadas').first()).toBeVisible();

		const accentBefore = await cores
			.getByRole('textbox', { name: 'Destaque', exact: true })
			.inputValue();
		await cores.getByRole('button', { name: 'Complementar' }).click();
		await expect(cores.getByRole('textbox', { name: 'Destaque', exact: true })).not.toHaveValue(
			accentBefore
		);
		await expect(cores.getByRole('textbox', { name: 'Primária', exact: true })).toHaveValue(
			'#e2725b'
		);
	});

	test('a paleta aleatória sempre respeita as regras da marca', async ({ page }) => {
		const rules = page.getByRole('list', { name: 'Regras da marca' });
		for (let i = 0; i < 10; i++) {
			await editor(page)
				.getByRole('button', { name: /Paleta aleatória/ })
				.click();
			await expect(rules.getByText('✕')).toHaveCount(0);
		}
	});

	test('padrão, acabamento, modo, neutros e fonte mudam a prévia', async ({ page }) => {
		await pickPattern(page, /Blueprint/);
		await expect(preview(page)).toHaveAttribute('data-pattern', 'blueprint');

		await pickFinish(page, 'Vidro');
		await expect(preview(page)).toHaveAttribute('data-style', 'vidro');

		await page.getByRole('group', { name: 'Modo' }).getByRole('button', { name: /Claro/ }).click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

		const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		const before = await background();
		await choose(page, 'Neutros', 'Quente (marrom)');
		await expect.poll(background).not.toBe(before);

		await choose(page, 'Tipografia', 'DM Sans + Noto Serif');
		await expect
			.poll(() =>
				page.evaluate(() =>
					getComputedStyle(document.documentElement).getPropertyValue('--brand-font-heading')
				)
			)
			.toContain('Noto Serif');
	});

	test('setas do teclado trocam paleta e padrão, mas não roubam a digitação', async ({ page }) => {
		const pattern = () => preview(page).getAttribute('data-pattern');
		await page.locator('body').click({ position: { x: 5, y: 300 } });
		const before = await pattern();
		await page.keyboard.press('ArrowDown');
		await expect.poll(pattern).not.toBe(before);

		const name = page.getByRole('textbox', { name: /Nome da marca/ });
		await name.focus();
		const typing = await pattern();
		await page.keyboard.press('ArrowDown');
		expect(await pattern()).toBe(typing);
	});

	test('a escolha continua depois de recarregar', async ({ page }) => {
		await page.getByRole('textbox', { name: /Nome da marca/ }).fill('Aurora');
		await pickPattern(page, /Material 3 Expressive/);
		await pickFinish(page, /Metálico/);
		await page.getByRole('group', { name: 'Modo' }).getByRole('button', { name: /Claro/ }).click();

		await page.reload();
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aurora');
		await expect(preview(page)).toHaveAttribute('data-pattern', 'material');
		await expect(preview(page)).toHaveAttribute('data-style', 'metalico');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	});
});

import { expect, openApp, test } from './fixtures.ts';

test.describe('prévia em tela cheia', () => {
	test.beforeEach(async ({ page }) => openApp(page));

	const openFullscreen = async (page: import('@playwright/test').Page) => {
		await page.getByRole('button', { name: /Tela cheia/ }).click();
		const dialog = page.getByRole('dialog', { name: 'Prévia em tela cheia' });
		await expect(dialog).toBeVisible();
		return dialog;
	};

	test('cresce a partir da prévia até ocupar a tela', async ({ page }) => {
		const previewBox = (await page.locator('#preview').boundingBox())!;

		// Amostra a escala e a posição do diálogo durante a animação, quadro a quadro.
		const frames = await page.evaluate(
			() =>
				new Promise<{ scale: number; x: number }[]>((done) => {
					const out: { scale: number; x: number }[] = [];
					[...document.querySelectorAll('button')]
						.find((b) => b.textContent?.includes('Tela cheia'))!
						.click();
					const start = performance.now();
					const tick = () => {
						const dialog = document.querySelector('[role=dialog]');
						if (dialog) {
							const m = new DOMMatrix(getComputedStyle(dialog).transform);
							out.push({ scale: m.a, x: m.e });
						}
						if (performance.now() - start < 900) requestAnimationFrame(tick);
						else done(out);
					};
					requestAnimationFrame(tick);
				})
		);

		const first = frames[0];
		const last = frames.at(-1)!;
		// Começa na largura e na posição da prévia...
		expect(first.scale).toBeCloseTo(previewBox.width / page.viewportSize()!.width, 1);
		expect(first.x).toBeGreaterThan(previewBox.x * 0.8);
		// ...cresce sem voltar atrás...
		for (let i = 1; i < frames.length; i++)
			expect(frames[i].scale).toBeGreaterThanOrEqual(frames[i - 1].scale - 0.001);
		// ...e termina em tela cheia.
		expect(last.scale).toBe(1);
		expect(last.x).toBe(0);
	});

	test('mostra só prévia e controles, e as setas continuam funcionando', async ({ page }) => {
		const dialog = await openFullscreen(page);
		await expect(dialog.getByRole('tablist', { name: 'O que escolher' })).toBeVisible();
		await expect(dialog.getByRole('group', { name: 'Paletas' })).toBeVisible();
		await expect(
			page.getByRole('complementary', { name: 'Escolha de padrão, acabamento e cor' })
		).toHaveCount(1);
		expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');

		const pattern = () => dialog.locator('.pv').getAttribute('data-pattern');
		const before = await pattern();
		await page.keyboard.press('ArrowDown');
		await expect.poll(pattern).not.toBe(before);

		await dialog
			.getByRole('group', { name: 'Modo' })
			.getByRole('button', { name: /Claro/ })
			.click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	});

	test('o fechar não fica por cima de outro controle', async ({ page }) => {
		const dialog = await openFullscreen(page);
		const close = (await dialog.getByRole('button', { name: /Fechar/ }).boundingBox())!;
		const mode = (await dialog.getByRole('group', { name: 'Modo' }).boundingBox())!;
		const overlaps =
			close.x < mode.x + mode.width &&
			close.x + close.width > mode.x &&
			close.y < mode.y + mode.height &&
			close.y + close.height > mode.y;
		expect(overlaps).toBe(false);
	});

	test('fecha pelo botão e pelo Esc, e o foco volta para quem abriu', async ({ page }) => {
		const trigger = page.getByRole('button', { name: /Tela cheia/ });

		let dialog = await openFullscreen(page);
		await dialog.getByRole('button', { name: /Fechar/ }).click();
		await expect(dialog).toHaveCount(0);
		await expect(trigger).toBeFocused();

		dialog = await openFullscreen(page);
		await page.keyboard.press('Escape');
		await expect(dialog).toHaveCount(0);
		await expect(trigger).toBeFocused();
		expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
	});
});

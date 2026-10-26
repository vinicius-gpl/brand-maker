/** O bottom sheet abre e recolhe deslizando (e na hora, com "reduzir movimento"). */
import { expect, openApp, test } from './fixtures.ts';

const SHEET = 'aside[aria-label="Escolha de padrão, acabamento e cor"]';

/** Clica no botão e amostra a altura do bottom sheet a cada quadro por `ms`. */
function sampleHeights(page: import('@playwright/test').Page, button: string, ms = 600) {
	return page.evaluate(
		([sheetSelector, label, duration]) =>
			new Promise<number[]>((done) => {
				const sheet = document.querySelector<HTMLElement>(sheetSelector as string)!;
				const heights: number[] = [];
				document.querySelector<HTMLElement>(`button[aria-label="${label}"]`)!.click();
				const start = performance.now();
				const tick = () => {
					heights.push(Math.round(sheet.getBoundingClientRect().height));
					if (performance.now() - start < (duration as number)) requestAnimationFrame(tick);
					else done(heights);
				};
				requestAnimationFrame(tick);
			}),
		[SHEET, button, ms] as const
	);
}

test.describe('bottom sheet', () => {
	test.beforeEach(async ({ page }) => openApp(page));

	test('recolhe e abre deslizando, passando por alturas intermediárias', async ({ page }) => {
		const open = Math.round((await page.locator(SHEET).boundingBox())!.height);

		const closing = await sampleHeights(page, 'Recolher opções');
		const closed = closing.at(-1)!;
		expect(closed).toBeLessThan(open);
		// Desliza: há quadros entre aberto e fechado, e a altura só diminui.
		expect(closing.some((h) => h < open - 4 && h > closed + 4)).toBe(true);
		for (let i = 1; i < closing.length; i++)
			expect(closing[i]).toBeLessThanOrEqual(closing[i - 1] + 1);

		const opening = await sampleHeights(page, 'Mostrar opções');
		expect(opening.at(-1)).toBe(open);
		expect(opening.some((h) => h > closed + 4 && h < open - 4)).toBe(true);
	});

	test('com "reduzir movimento", muda na hora', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		const open = Math.round((await page.locator(SHEET).boundingBox())!.height);
		const closing = await sampleHeights(page, 'Recolher opções', 200);
		const closed = closing.at(-1)!;
		expect(closed).toBeLessThan(open);
		expect(closing.every((h) => h === closed || h === open)).toBe(true);
	});
});

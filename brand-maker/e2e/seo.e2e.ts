/** SEO: metatags de compartilhamento, sitemap e robots saem no build com URL absoluta. */
import { expect, openApp, test } from './fixtures.ts';

test.describe('seo', () => {
	test('a página tem canonical, Open Graph e dados estruturados', async ({ page }) => {
		await openApp(page);
		const meta = (selector: string) => page.locator(selector).getAttribute('content');
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			/^https?:\/\/.+\/$/
		);
		expect(await meta('meta[property="og:image"]')).toMatch(/^https?:\/\/.+\/og\.jpg$/);
		expect(await meta('meta[property="og:image:width"]')).toBe('1200');
		expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
		const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
		expect(JSON.parse(jsonLd!)['@type']).toBe('WebApplication');
	});

	test('sitemap.xml, robots.txt e a imagem de compartilhamento existem', async ({ request }) => {
		const sitemap = await request.get('sitemap.xml');
		expect(sitemap.ok()).toBe(true);
		expect(await sitemap.text()).toMatch(/<loc>https?:\/\/.+\/<\/loc>/);
		const robots = await (await request.get('robots.txt')).text();
		expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
		const image = await request.get('og.jpg');
		expect(image.headers()['content-type']).toBe('image/jpeg');
		// WhatsApp ignora prévias acima de ~300 KB.
		expect((await image.body()).byteLength).toBeLessThan(300 * 1024);
	});
});

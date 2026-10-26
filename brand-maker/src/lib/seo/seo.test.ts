import { describe, expect, it } from 'vitest';
import { absoluteUrl, jsonLd, robotsTxt, SITE, sitemapXml } from './seo.ts';

const SITE_URL = 'https://exemplo.github.io/brand-maker';

describe('absoluteUrl', () => {
	it('joins the site address and a path with exactly one slash', () => {
		// feliz
		expect(absoluteUrl(SITE_URL)).toBe(`${SITE_URL}/`);
		expect(absoluteUrl(`${SITE_URL}/`, '/og.jpg')).toBe(`${SITE_URL}/og.jpg`);
		expect(absoluteUrl('https://exemplo.com', 'sitemap.xml')).toBe(
			'https://exemplo.com/sitemap.xml'
		);
	});
});

describe('sitemapXml', () => {
	const xml = sitemapXml(SITE_URL, new Date('2026-10-25T21:00:00Z'), ['/og.jpg']);

	it('lists the canonical URL with the build date and the page images', () => {
		expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset /);
		expect(xml).toContain(`<loc>${SITE_URL}/</loc>`);
		expect(xml).toContain('<lastmod>2026-10-25</lastmod>');
		expect(xml).toContain(`<image:loc>${SITE_URL}/og.jpg</image:loc>`);
		expect(xml.match(/<url>/g)).toHaveLength(1);
	});

	it('leaves out the fields search engines ignore and escapes the URL', () => {
		// triste: changefreq/priority só pesam; & cru quebra o XML
		expect(xml).not.toMatch(/changefreq|priority/);
		expect(sitemapXml('https://a.com/?x=1&y=2', new Date(0))).toContain('&amp;y=2');
	});
});

describe('robotsTxt', () => {
	it('allows everything and points to the absolute sitemap', () => {
		expect(robotsTxt(SITE_URL)).toBe(
			`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
		);
	});
});

describe('jsonLd', () => {
	it('describes a free web app and cannot close the script tag', () => {
		const data = JSON.parse(jsonLd(SITE_URL));
		expect(data).toMatchObject({
			'@type': 'WebApplication',
			name: SITE.name,
			url: `${SITE_URL}/`,
			isAccessibleForFree: true
		});
		expect(jsonLd(SITE_URL)).not.toContain('<');
	});
});

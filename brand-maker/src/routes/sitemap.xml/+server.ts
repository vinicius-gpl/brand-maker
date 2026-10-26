import { SITE, SITE_URL, sitemapXml } from '#lib/seo/seo.ts';

// Gerado no build (o site é estático): a data é a do build.
export const prerender = true;

export function GET(): Response {
	const xml = sitemapXml(SITE_URL, new Date(), [SITE.image.path]);
	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

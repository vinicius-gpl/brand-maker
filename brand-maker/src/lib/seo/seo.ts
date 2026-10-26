/**
 * SEO do site: endereço público, metadados de compartilhamento, sitemap e robots.
 * O site tem uma página só (as seções são âncoras da mesma URL), então o sitemap lista uma URL,
 * com a data do build e as imagens que o Google pode indexar.
 */

/** Endereço público com o caminho base, sem barra no fim (vem de SITE_URL no build). */
export const SITE_URL = __SITE_URL__;

export const SITE = {
	name: 'Brand Maker',
	title: 'Brand Maker · monte a identidade visual e baixe o kit de design',
	description:
		'Monte a identidade visual na tela (cores, padrão de interface e acabamento) e baixe um kit com tokens CSS, skills e hooks .mjs que mantêm o agente dentro do design.',
	locale: 'pt_BR',
	language: 'pt-BR',
	themeColor: '#121214',
	/** Imagem de compartilhamento: 1200×630, JPG leve (LinkedIn, WhatsApp, X, Facebook). */
	image: {
		path: '/og.jpg',
		width: 1200,
		height: 630,
		alt: 'Editor do Brand Maker com a prévia da marca'
	}
} as const;

/** Junta o endereço do site com um caminho (`/` vira a página inicial). */
export function absoluteUrl(siteUrl: string, path = '/'): string {
	return `${siteUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

const escapeXml = (text: string) =>
	text.replace(
		/[<>&'"]/g,
		(c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[c]};`
	);

/**
 * Sitemap mínimo e válido: só a URL canônica, `lastmod` (o único campo que o Google usa; ele
 * ignora `changefreq` e `priority`) e as imagens da página na extensão de imagens.
 */
export function sitemapXml(siteUrl: string, lastmod: Date, images: string[] = []): string {
	const imageTags = images
		.map(
			(path) =>
				`\n    <image:image><image:loc>${escapeXml(absoluteUrl(siteUrl, path))}</image:loc></image:image>`
		)
		.join('');
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${escapeXml(absoluteUrl(siteUrl))}</loc>
    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>${imageTags}
  </url>
</urlset>
`;
}

/** Libera tudo e aponta o sitemap (precisa de URL absoluta). */
export function robotsTxt(siteUrl: string): string {
	return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl(siteUrl, 'sitemap.xml')}
`;
}

/** Dados estruturados (schema.org) para o Google entender que é um app web gratuito. */
export function jsonLd(siteUrl: string): string {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: SITE.name,
		url: absoluteUrl(siteUrl),
		description: SITE.description,
		image: absoluteUrl(siteUrl, SITE.image.path),
		inLanguage: SITE.language,
		applicationCategory: 'DesignApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript',
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' }
	}).replace(/</g, '\\u003c');
}

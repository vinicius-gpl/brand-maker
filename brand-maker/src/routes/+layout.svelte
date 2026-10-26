<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { absoluteUrl, jsonLd, SITE, SITE_URL } from '#lib/seo/seo.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const canonical = absoluteUrl(SITE_URL);
	const image = absoluteUrl(SITE_URL, SITE.image.path);
	// JSON-LD vai como texto pronto: o Svelte não interpreta o conteúdo de <script> no head.
	const structuredData = `<script type="application/ld+json">${jsonLd(SITE_URL)}</` + 'script>';
</script>

<!-- SEO e compartilhamento (Google, LinkedIn, WhatsApp, X, Facebook). -->
<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="canonical" href={canonical} />
	<meta name="description" content={SITE.description} />
	<meta name="theme-color" content={SITE.themeColor} />
	<meta name="robots" content="index, follow, max-image-preview:large" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:locale" content={SITE.locale} />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={SITE.title} />
	<meta property="og:description" content={SITE.description} />
	<meta property="og:image" content={image} />
	<meta property="og:image:secure_url" content={image} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content={String(SITE.image.width)} />
	<meta property="og:image:height" content={String(SITE.image.height)} />
	<meta property="og:image:alt" content={SITE.image.alt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={SITE.title} />
	<meta name="twitter:description" content={SITE.description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={SITE.image.alt} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON nosso, sem entrada de quem usa, e com "<" escapado em jsonLd(). -->
	{@html structuredData}
</svelte:head>

{@render children()}

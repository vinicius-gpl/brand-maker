import { robotsTxt, SITE_URL } from '#lib/seo/seo.ts';

export const prerender = true;

export function GET(): Response {
	return new Response(robotsTxt(SITE_URL), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}

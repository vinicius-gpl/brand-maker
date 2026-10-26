/**
 * Conteúdo de exemplo da prévia. O texto da marca (nome, slogan, descrição) vem da identidade
 * que a pessoa escreve; o resto é genérico, só para mostrar cada token em uso.
 */
import type { BrandIdentity, StatusName } from '#lib/types/design.type.ts';

export const DEFAULT_IDENTITY: BrandIdentity = {
	name: 'Minha Marca',
	tagline: 'Feito com cuidado, do jeito certo.',
	description:
		'Uma frase curta sobre o que a marca faz e para quem. Ela aparece aqui embaixo do título e no README do kit.',
	logo: null
};

export const PREVIEW_SAMPLE = {
	nav: ['Início', 'Produto', 'Preços', 'Contato'],
	cta: 'Entrar',
	actions: { primary: 'Começar agora', accent: 'Ver demonstração', ghost: 'Saiba mais' },
	cards: [
		{
			title: 'Projeto Aurora',
			text: 'Lançado na semana passada, com 1.284 pessoas usando.',
			status: 'success',
			label: 'No ar',
			tags: ['Web', 'Mobile']
		},
		{
			title: 'Projeto Brisa',
			text: 'Em revisão final, publicação prevista para sexta.',
			status: 'warning',
			label: 'Revisão',
			tags: ['API']
		},
		{
			title: 'Projeto Coral',
			text: 'Protótipo em teste com os primeiros clientes.',
			status: 'info',
			label: 'Em teste',
			tags: ['Beta', 'Web']
		}
	] satisfies { title: string; text: string; status: StatusName; label: string; tags: string[] }[],
	chart: { title: 'Visitas por canal', labels: ['Busca', 'Social', 'Direto', 'E-mail', 'Outros'] },
	form: { title: 'Receba novidades', placeholder: 'voce@exemplo.com' },
	url: (slug: string) => `https://${slug}.exemplo.com`
};

/** Divide o slogan para destacar a última palavra no título da prévia. */
export function splitTagline(tagline: string): {
	before: string;
	highlight: string;
	after: string;
} {
	const match = tagline.trim().match(/^(.*?)([\p{L}\p{N}-]+)([^\p{L}\p{N}]*)$/u);
	if (!match) return { before: tagline, highlight: '', after: '' };
	return { before: match[1], highlight: match[2], after: match[3] };
}

/** Iniciais para o monograma quando não há logo (`Café do Zé` → `CZ`). */
export function initials(name: string): string {
	const all = name.trim().split(/\s+/).filter(Boolean);
	const meaningful = all.filter((w) => w.length > 2 || /^[A-Z]/.test(w));
	const words = meaningful.length ? meaningful : all;
	if (!words.length) return '';
	return words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '');
}

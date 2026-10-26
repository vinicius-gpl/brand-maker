/** Nome da marca → identificador de arquivo e de skill (`Café do Zé` → `cafe-do-ze`). */
export const DEFAULT_SLUG = 'minha-marca';

export function slugify(text: string): string {
	const slug = text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug || DEFAULT_SLUG;
}

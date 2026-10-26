/**
 * Junta classes do Tailwind: `clsx` resolve as condicionais (objeto, array, falsy) e o
 * `tailwind-merge` desfaz o conflito, ficando com a última (`cn('h-8', 'h-10')` → `h-10`).
 * Assim um componente aceita `className` de fora sem duplicar nem brigar com a própria classe.
 */
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Os utilitários próprios de `theme/tokens.css` entram no merge: `control`/`control-sm` são
 * altura (conflitam com `h-*`), e `rounded-control`/`rounded-surface` são raio da escala.
 */
const merge = extendTailwindMerge<'control-height'>({
	extend: {
		classGroups: {
			'control-height': ['control', 'control-sm']
		},
		// Nos dois sentidos: `control` tira um `h-*` anterior, e um `h-*` posterior tira o `control`.
		conflictingClassGroups: {
			'control-height': ['h'],
			h: ['control-height']
		},
		theme: {
			radius: ['control', 'surface']
		}
	}
});

export function cn(...inputs: ClassValue[]): string {
	return merge(clsx(inputs));
}

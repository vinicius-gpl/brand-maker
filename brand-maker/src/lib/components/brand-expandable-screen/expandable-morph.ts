/**
 * Transição "morph": a tela cheia nasce do retângulo do gatilho e volta para ele. É o
 * equivalente Svelte do `layoutId` do Framer Motion usado pela cult-ui.
 *
 * O conteúdo cresce de verdade (zoom), em vez de ser só revelado:
 * - escala uniforme, partindo da largura do gatilho (não distorce texto nem bordas);
 * - um recorte na base acompanha a altura do gatilho até a da tela;
 * - o raio vai do raio do gatilho até o do conteúdo, compensado pela escala;
 * - a opacidade sobe no primeiro quarto e desce no último: o gatilho continua visível por
 *   baixo, então a troca entre os dois é um cross-fade, sem salto.
 */
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { prefersReducedMotion } from '#lib/utils/motion.util.ts';

export type MorphParams = {
	origin: HTMLElement | null;
	fromRadius: string;
	toRadius: string;
	/** Em segundos, como na API da cult-ui. */
	duration: number;
};

const CROSSFADE = 0.25;

export function morph(
	_node: Element,
	{ origin, fromRadius, toRadius, duration }: MorphParams
): TransitionConfig {
	const rect = origin?.getBoundingClientRect();
	if (!rect || prefersReducedMotion()) return { duration: 0 };

	const viewport = { width: innerWidth, height: innerHeight };
	const startScale = rect.width / viewport.width;

	return {
		duration: duration * 1000,
		easing: cubicOut,
		// t vai de 0 (no gatilho) a 1 (tela cheia) na entrada, e de 1 a 0 na saída.
		css: (t) => {
			const k = 1 - t;
			const scale = startScale + (1 - startScale) * t;
			// Altura visível na tela, convertida para a escala atual do conteúdo.
			const visibleHeight = (rect.height + (viewport.height - rect.height) * t) / scale;
			const radius = `calc((${fromRadius} * ${k} + ${toRadius} * ${t}) / ${scale})`;
			return `
				transform-origin: 0 0;
				transform: translate(${rect.left * k}px, ${rect.top * k}px) scale(${scale});
				clip-path: inset(0 0 max(0px, calc(100% - ${visibleHeight}px)) 0 round ${radius});
				opacity: ${Math.min(1, t / CROSSFADE)};
				overflow: hidden;
			`;
		}
	};
}

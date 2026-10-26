/**
 * Movimento que respeita "reduzir movimento". As transições do Svelte rodam pela Web Animations
 * API (JavaScript), onde a regra global de CSS não chega; por isso a duração passa por aqui.
 */
export function prefersReducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** A duração pedida, ou zero quando a pessoa pediu menos movimento. */
export function motionMs(ms: number): number {
	return prefersReducedMotion() ? 0 : ms;
}

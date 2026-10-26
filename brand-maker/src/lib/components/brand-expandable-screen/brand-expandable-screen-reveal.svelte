<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { cn } from '#lib/utils/cn.util.ts';
	import { useExpandableScreen } from './brand-expandable-screen.context.ts';

	export type BrandExpandableScreenRevealProps = {
		/** Posicionamento do invólucro (ex.: `sticky top-0` para uma barra que gruda no topo). */
		ui?: { className?: string };
		children: Snippet;
	};

	let { ui, children }: BrandExpandableScreenRevealProps = $props();

	const screen = useExpandableScreen();
	const durationMs = $derived(screen.animationDuration * 1000);
</script>

<!--
	O que só existe na tela cheia (barras, controles) não participa do zoom: aparece quando a
	expansão termina e some antes de a tela voltar para o gatilho.
	`|global`: a transição roda junto com a abertura e o fechamento do conteúdo, que é o bloco pai.
-->
<div
	class={cn(ui?.className)}
	in:fade|global={{ delay: durationMs * 0.85, duration: 180 }}
	out:fade|global={{ duration: 120 }}
>
	{@render children()}
</div>

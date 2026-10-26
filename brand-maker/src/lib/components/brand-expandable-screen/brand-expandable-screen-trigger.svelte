<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useExpandableScreen } from './brand-expandable-screen.context.ts';

	export type BrandExpandableScreenTriggerProps = {
		ui?: { className?: string };
		/** Recebe `expand`: quem abre é um botão de dentro, não o bloco inteiro. */
		children: Snippet<[{ expand: () => void; expanded: boolean }]>;
	};

	let { ui, children }: BrandExpandableScreenTriggerProps = $props();

	const screen = useExpandableScreen();
	let element = $state<HTMLElement>();

	$effect(() => {
		screen.setOrigin(element ?? null);
		return () => screen.setOrigin(null);
	});
</script>

<!--
	Origem da animação. Fica visível por baixo da tela cheia: no começo e no fim do zoom a tela
	cheia está semitransparente, e a troca entre os dois vira um cross-fade sem salto.
-->
<div bind:this={element} class={ui?.className}>
	{@render children({ expand: screen.expand, expanded: screen.expanded })}
</div>

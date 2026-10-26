<script lang="ts">
	import BrandPaletteCard from '#lib/components/brand-palette-card/brand-palette-card.svelte';
	import type { Mode, Neutral, PaletteEntry } from '#lib/types/design.type.ts';
	import { buildTokens } from '#lib/utils/tokens.util.ts';

	export type BrandPaletteCarouselProps = {
		data: { palettes: PaletteEntry[]; paletteId: string; mode: Mode; neutral: Neutral };
		ui: { id: string };
		actions: { onSelect: (id: string) => void };
	};

	let { data, ui, actions }: BrandPaletteCarouselProps = $props();

	let track = $state<HTMLElement>();

	/** Centraliza a paleta ativa dentro do trilho, sem rolar a página. */
	$effect(() => {
		void data.paletteId;
		void data.palettes;
		const active = track?.querySelector<HTMLElement>('[aria-pressed="true"]');
		if (!track || !active) return;
		track.scrollTo({ left: active.offsetLeft - track.clientWidth / 2 + active.offsetWidth / 2 });
	});
</script>

<!--
	Trilho com folga em cima e embaixo (o anel da paleta ativa não é cortado), bordas esmaecidas
	e barra de rolagem fina que acende na cor da marca ao passar o mouse.
-->
<div
	id={ui.id}
	bind:this={track}
	class="flex min-w-0 snap-x snap-mandatory scroll-px-4 scrollbar-slim scrollbar-thumb-border gap-3 overflow-x-auto scroll-smooth fade-x px-4 pt-2.5 pb-3 hover:scrollbar-thumb-primary"
	role="group"
	aria-label="Paletas"
>
	{#each data.palettes as palette (palette.id)}
		<BrandPaletteCard
			data={{
				palette,
				tokens: buildTokens(palette, data.mode, data.neutral),
				neutral: data.neutral[data.mode]
			}}
			state={{ selected: palette.id === data.paletteId }}
			actions={{ onSelect: actions.onSelect }}
		/>
	{/each}
</div>

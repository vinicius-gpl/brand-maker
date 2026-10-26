<script lang="ts">
	import type { NeutralScale, PaletteEntry, Tokens } from '#lib/types/design.type.ts';
	import { cn } from '#lib/utils/cn.util.ts';

	export type BrandPaletteCardProps = {
		data: { palette: PaletteEntry; tokens: Tokens; neutral: NeutralScale };
		state: { selected: boolean };
		actions: { onSelect: (id: string) => void };
	};

	let { data, state, actions }: BrandPaletteCardProps = $props();
</script>

<!-- Miniatura da paleta sobre o fundo do modo atual: o "Aa" na cor de texto da marca. -->
<button
	type="button"
	class={cn(
		'group flex w-32 shrink-0 snap-center flex-col gap-1 rounded-surface border border-border bg-background p-2 text-left transition duration-200 hover:-translate-y-0.5 hover:border-muted-foreground/60 sm:w-36 sm:gap-1.5 sm:p-2.5',
		state.selected && 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-card'
	)}
	aria-pressed={state.selected}
	onclick={() => actions.onSelect(data.palette.id)}
>
	<span
		class="relative flex h-11 items-end justify-end gap-1 rounded-lg border p-1.5 sm:h-14"
		style:background={data.neutral.background}
		style:border-color={data.neutral.border}
	>
		<b
			class="absolute top-1.5 left-2 text-lg font-extrabold tracking-tight"
			style:color={data.tokens['primary-strong']}>Aa</b
		>
		{#each [data.tokens.primary, data.tokens['accent-hero'], data.tokens.tertiary] as swatch, i (i)}
			<i class="size-4 rounded transition-transform group-hover:scale-110" style:background={swatch}
			></i>
		{/each}
	</span>
	<span class="truncate text-xs leading-tight font-semibold">{data.palette.name}</span>
	<span class="font-mono text-[0.62rem] tracking-wider text-muted-foreground uppercase"
		>{data.palette.group.name}</span
	>
</button>

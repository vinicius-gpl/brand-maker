<script lang="ts">
	import type { Tokens } from '#lib/types/design.type.ts';
	import { labelColorOn } from '#lib/utils/color.util.ts';

	export type BrandKeyColorsProps = {
		data: { dark: Tokens; light: Tokens };
		actions: { onCopy: (hex: string) => void };
	};

	let { data, actions }: BrandKeyColorsProps = $props();

	const KEY_COLORS = [
		{ label: 'Primária', fill: 'primary', text: 'primary-strong' },
		{ label: 'Destaque', fill: 'accent-hero', text: 'accent-strong' },
		{ label: 'Terceira', fill: 'tertiary', text: 'tertiary-strong' }
	];
</script>

{#snippet cell(hex: string, mode: string)}
	<button
		type="button"
		class="flex min-w-0 flex-col items-start justify-end gap-0.5 p-2.5 text-left font-mono text-xs"
		style:background={hex}
		style:color={labelColorOn(hex)}
		aria-label="Copiar {hex}"
		onclick={() => actions.onCopy(hex)}
	>
		<span class="opacity-70">{mode}</span>{hex}
	</button>
{/snippet}

<div class="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3">
	{#each KEY_COLORS as key (key.fill)}
		<figure class="m-0 overflow-hidden rounded-surface border border-border bg-card">
			<div class="grid h-24 grid-cols-2">
				{@render cell(data.dark[key.fill], 'escuro')}
				{@render cell(data.light[key.fill], 'claro')}
			</div>
			<figcaption class="grid gap-0.5 px-3 py-2.5 text-sm">
				<b>{key.label}</b>
				<span class="font-mono text-xs text-muted-foreground"
					>texto: {data.dark[key.text]} / {data.light[key.text]}</span
				>
			</figcaption>
		</figure>
	{/each}
</div>

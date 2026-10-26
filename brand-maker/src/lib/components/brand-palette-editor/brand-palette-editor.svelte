<script lang="ts">
	import { Dices } from '@lucide/svelte';
	import type { PaletteColors, PaletteEntry } from '#lib/types/design.type.ts';
	import { HARMONIES, type HarmonyId } from '#lib/utils/harmony.util.ts';

	export type BrandPaletteEditorProps = {
		data: { palette: PaletteEntry; colors: PaletteColors };
		actions: {
			onColor: (key: keyof PaletteColors, hex: string) => void;
			onHarmony: (harmony: HarmonyId) => void;
			onRandom: () => void;
		};
	};

	let { data, actions }: BrandPaletteEditorProps = $props();

	const COLOR_FIELDS: { key: keyof PaletteColors; label: string; hint: string }[] = [
		{ key: 'primary', label: 'Primária', hint: 'Ação principal, links, destaque do título' },
		{ key: 'accent', label: 'Destaque', hint: 'Segundo destaque, um por vez' },
		{ key: 'tertiary', label: 'Terceira', hint: 'Gráficos e detalhes' }
	];
</script>

<fieldset class="grid gap-3.5">
	<legend
		class="mb-3 flex w-full items-baseline justify-between gap-2 font-heading text-base font-bold"
	>
		Cores
		<span class="truncate font-sans text-xs font-normal text-muted-foreground">
			{data.palette.group.id === 'custom'
				? 'Personalizada'
				: `${data.palette.name} · ${data.palette.group.name}`}
		</span>
	</legend>

	{#each COLOR_FIELDS as field (field.key)}
		{@const hex = data.colors[field.key]}
		<div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5">
			<!-- O seletor nativo é o alvo grande (40px); o campo de texto aceita hex colado. -->
			<input
				type="color"
				class="row-span-2 size-10 cursor-pointer rounded-control border border-border bg-transparent p-0.5"
				value={hex}
				aria-label="Escolher a cor {field.label}"
				oninput={(e) => actions.onColor(field.key, e.currentTarget.value)}
			/>
			<label class="flex items-center justify-between gap-2 text-sm font-medium">
				{field.label}
				<input
					class="control w-28 rounded-control border border-border bg-background px-2.5 font-mono text-sm uppercase"
					value={hex}
					maxlength="7"
					spellcheck="false"
					autocomplete="off"
					onchange={(e) => actions.onColor(field.key, e.currentTarget.value.trim())}
				/>
			</label>
			<span class="text-xs text-muted-foreground">{field.hint}</span>
		</div>
	{/each}

	<div class="grid gap-2 border-t border-border pt-3.5">
		<span class="text-sm font-medium">Gerar a partir da primária</span>
		<div class="grid grid-cols-2 gap-2" role="group" aria-label="Harmonias de cor">
			{#each HARMONIES as harmony (harmony.id)}
				<button
					type="button"
					class="control rounded-control border border-border bg-background px-3 text-sm font-medium hover:border-primary"
					title={harmony.description}
					onclick={() => actions.onHarmony(harmony.id)}>{harmony.name}</button
				>
			{/each}
		</div>
		<button
			type="button"
			class="inline-flex control items-center justify-center gap-2 rounded-control border border-dashed border-border px-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-foreground"
			onclick={actions.onRandom}
		>
			<Dices class="size-4" aria-hidden="true" /> Paleta aleatória (fora do roxo e do azul)
		</button>
	</div>
</fieldset>

<script lang="ts">
	import { Moon, Sun, X } from '@lucide/svelte';
	import BrandSegmented from '#lib/components/brand-segmented/brand-segmented.svelte';
	import type { Mode } from '#lib/types/design.type.ts';

	export type BrandFullscreenBarProps = {
		data: {
			brandName: string;
			paletteLabel: string;
			patternName: string;
			mode: Mode;
		};
		actions: {
			onMode: (mode: Mode) => void;
			onClose: () => void;
		};
	};

	let { data, actions }: BrandFullscreenBarProps = $props();

	const modeOptions = [
		{ value: 'dark' as const, label: 'Escuro', icon: Moon },
		{ value: 'light' as const, label: 'Claro', icon: Sun }
	];
</script>

<!--
	Barra da tela cheia: o que está sendo visto, o modo e o fechar, todos no fluxo da barra (nada
	flutua por cima). Quem gruda no topo é o invólucro.
-->
<div
	class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur-md sm:px-6"
>
	<div class="min-w-0">
		<p class="truncate font-heading text-sm font-bold">{data.brandName}</p>
		<p class="truncate text-xs text-muted-foreground">
			<b class="text-primary-strong">{data.paletteLabel}</b> · padrão
			<b class="text-primary-strong">{data.patternName}</b>
			<span class="hidden md:inline">· ←/→ cor · ↑/↓ padrão · Esc fecha</span>
		</p>
	</div>
	<div class="ml-auto flex items-center gap-2">
		<BrandSegmented
			data={{ options: modeOptions, value: data.mode }}
			ui={{ label: 'Modo' }}
			actions={{ onSelect: actions.onMode }}
		/>
		<button
			type="button"
			class="inline-flex control items-center gap-2 rounded-control border border-border bg-card px-3.5 text-sm font-semibold hover:border-primary"
			aria-label="Fechar tela cheia (Esc)"
			title="Fechar (Esc)"
			onclick={actions.onClose}
		>
			<X class="size-4" aria-hidden="true" /> Fechar
		</button>
	</div>
</div>

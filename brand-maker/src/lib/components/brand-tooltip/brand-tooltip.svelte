<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type BrandTooltipProps = {
		ui: { label: string; side?: 'top' | 'bottom' | 'left' | 'right' };
		/**
		 * Recebe as `props` do gatilho (eventos, aria, ref) para espalhar no elemento interativo
		 * de quem usa: o tooltip se prende a um botão de verdade, não a um invólucro.
		 */
		children: Snippet<[{ props: Record<string, unknown> }]>;
	};

	let { ui, children }: BrandTooltipProps = $props();
</script>

<!--
	Tooltip com bits-ui: abre no hover e no foco do teclado, fecha com Esc, e o texto fica ligado
	ao gatilho por aria-describedby. Cada tooltip traz o próprio Provider para funcionar sozinho.
-->
<Tooltip.Provider delayDuration={350}>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				{@render children({ props })}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Content
				side={ui.side ?? 'top'}
				sideOffset={6}
				class="z-60 max-w-64 rounded-md border border-border bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg shadow-shadow/30"
			>
				{ui.label}
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>

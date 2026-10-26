<script lang="ts">
	import { mergeProps } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import BrandTooltip from '#lib/components/brand-tooltip/brand-tooltip.svelte';
	import { cn } from '#lib/utils/cn.util.ts';

	export type BrandIconButtonProps = {
		/** Nome acessível e texto do tooltip: o ícone sozinho não diz nada. */
		ui: { label: string; className?: string };
		actions: { onClick: () => void };
		/** O ícone (Lucide). */
		children: Snippet;
	} & Pick<HTMLButtonAttributes, 'aria-expanded' | 'aria-controls'>;

	// O ícone chega como `children`; aqui ele vira `icon` para não confundir com o snippet do tooltip.
	let { ui, actions, children: icon, ...aria }: BrandIconButtonProps = $props();
</script>

<BrandTooltip ui={{ label: ui.label }}>
	{#snippet children({ props })}
		<!-- mergeProps junta os eventos do tooltip com os nossos (um não apaga o outro). -->
		<button
			type="button"
			{...mergeProps(props, {
				class: cn(
					'grid size-10 shrink-0 place-items-center rounded-control border border-border bg-background hover:border-primary [&_svg]:size-4',
					ui.className
				),
				'aria-label': ui.label,
				onclick: actions.onClick,
				...aria
			})}
		>
			<span class="contents" aria-hidden="true">{@render icon()}</span>
		</button>
	{/snippet}
</BrandTooltip>

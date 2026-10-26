<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils/cn.util.ts';

	export type BrandChipProps = {
		ui?: { className?: string };
		state: { pressed: boolean };
		actions: { onClick: () => void };
		children: Snippet;
	};

	let { ui, state, actions, children }: BrandChipProps = $props();
</script>

<!-- Opção alternável em pílula. 40px de altura: alvo mínimo da Lei de Fitts. -->
<button
	type="button"
	class={cn(
		'inline-flex control shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-sm whitespace-nowrap text-muted-foreground',
		state.pressed && 'border-transparent bg-primary font-semibold text-primary-foreground',
		ui?.className
	)}
	aria-pressed={state.pressed}
	onclick={actions.onClick}
>
	{@render children()}
</button>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { cn } from '#lib/utils/cn.util.ts';
	import { useExpandableScreen } from './brand-expandable-screen.context.ts';
	import { morph } from './expandable-morph.ts';

	export type BrandExpandableScreenContentProps = {
		ui: {
			/** Nome do diálogo para leitor de tela. */
			label: string;
			className?: string;
			showCloseButton?: boolean;
			closeButtonClassName?: string;
		};
		children: Snippet;
	};

	let { ui, children }: BrandExpandableScreenContentProps = $props();

	const screen = useExpandableScreen();
	let dialog = $state<HTMLElement>();
	let closeButton = $state<HTMLButtonElement>();
	let returnFocus: HTMLElement | null = null;

	/**
	 * Ao abrir, o foco vai para o fechar (ou para o próprio diálogo, quando o fechar mora no
	 * conteúdo, com `showCloseButton: false`); ao fechar, volta para quem abriu.
	 */
	$effect(() => {
		if (!screen.expanded) return;
		returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		(closeButton ?? dialog)?.focus({ preventScroll: true });
		return () => returnFocus?.focus({ preventScroll: true });
	});

	function onKeydown(event: KeyboardEvent) {
		if (screen.expanded && event.key === 'Escape') screen.collapse();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if screen.expanded}
	<div
		class={cn(
			'fixed inset-0 z-50 scrollbar-slim overflow-y-auto bg-background outline-none',
			ui.className
		)}
		bind:this={dialog}
		tabindex="-1"
		role="dialog"
		aria-modal="true"
		aria-label={ui.label}
		transition:morph={{
			origin: screen.origin,
			fromRadius: screen.triggerRadius,
			toRadius: screen.contentRadius,
			duration: screen.animationDuration
		}}
	>
		{@render children()}

		{#if ui.showCloseButton !== false}
			<button
				bind:this={closeButton}
				type="button"
				class={cn(
					'fixed top-2.5 right-3 z-30 inline-flex control items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-lg shadow-background/50 hover:border-primary',
					ui.closeButtonClassName
				)}
				aria-label="Fechar tela cheia (Esc)"
				title="Fechar (Esc)"
				onclick={screen.collapse}
				in:fade|global={{ delay: screen.animationDuration * 850, duration: 180 }}
				out:fade|global={{ duration: 120 }}
			>
				<X class="size-4" aria-hidden="true" /> Fechar
			</button>
		{/if}
	</div>
{/if}

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setExpandableScreen } from './brand-expandable-screen.context.ts';

	export type BrandExpandableScreenProps = {
		/** Aberto ou fechado. Pode ser ligado de fora com `bind:expanded`. */
		expanded?: boolean;
		triggerRadius?: string;
		contentRadius?: string;
		/** Duração da animação, em segundos. */
		animationDuration?: number;
		/** Trava a rolagem da página enquanto está aberto. */
		lockScroll?: boolean;
		onExpandChange?: (expanded: boolean) => void;
		children: Snippet;
	};

	let {
		expanded = $bindable(false),
		triggerRadius = '100px',
		contentRadius = '24px',
		animationDuration = 0.3,
		lockScroll = true,
		onExpandChange,
		children
	}: BrandExpandableScreenProps = $props();

	let origin = $state<HTMLElement | null>(null);

	function setExpanded(next: boolean) {
		if (expanded === next) return;
		expanded = next;
		onExpandChange?.(next);
	}

	setExpandableScreen({
		get expanded() {
			return expanded;
		},
		get origin() {
			return origin;
		},
		get triggerRadius() {
			return triggerRadius;
		},
		get contentRadius() {
			return contentRadius;
		},
		get animationDuration() {
			return animationDuration;
		},
		expand: () => setExpanded(true),
		collapse: () => setExpanded(false),
		setOrigin: (element) => (origin = element)
	});

	$effect(() => {
		if (!lockScroll || !expanded) return;
		const root = document.documentElement;
		const previous = root.style.overflow;
		root.style.overflow = 'hidden';
		return () => {
			root.style.overflow = previous;
		};
	});
</script>

{@render children()}

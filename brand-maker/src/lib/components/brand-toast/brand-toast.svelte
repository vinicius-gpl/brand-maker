<script lang="ts">
	import { cn } from '#lib/utils/cn.util.ts';

	export type BrandToastProps = { data: { message: string }; state: { visible: boolean } };

	let { data, state }: BrandToastProps = $props();
</script>

<div
	class={cn(
		'pointer-events-none fixed top-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background opacity-0 transition-opacity',
		state.visible && 'opacity-100'
	)}
	role="status"
	aria-live="polite"
>
	{data.message}
</div>

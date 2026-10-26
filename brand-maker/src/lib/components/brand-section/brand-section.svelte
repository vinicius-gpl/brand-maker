<script lang="ts">
	import type { Snippet } from 'svelte';

	export type BrandSectionProps = {
		data: { id: string; title: string; lead?: string };
		children: Snippet;
		actions?: Snippet;
	};

	let { data, children, actions }: BrandSectionProps = $props();
</script>

<section class="mt-12 scroll-mt-32" id={data.id} aria-labelledby="{data.id}-title">
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div class="max-w-2xl">
			<h2 id="{data.id}-title" class="font-heading text-lg font-bold">{data.title}</h2>
			{#if data.lead}<p class="mt-1 text-sm leading-relaxed text-muted-foreground">
					{data.lead}
				</p>{/if}
		</div>
		{#if actions}{@render actions()}{/if}
	</div>
	{@render children()}
</section>

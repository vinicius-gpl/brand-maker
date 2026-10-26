<script lang="ts">
	import type { Tokens } from '#lib/types/design.type.ts';
	import { labelColorOn } from '#lib/utils/color.util.ts';

	export type BrandTokenGridProps = {
		data: { tokens: Tokens };
		actions: { onCopy: (hex: string) => void };
	};

	let { data, actions }: BrandTokenGridProps = $props();
</script>

<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(132px,100%),1fr))] gap-2.5">
	{#each Object.entries(data.tokens) as [name, hex] (name)}
		<li>
			<button
				type="button"
				class="flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-left"
				aria-label="Copiar {name}: {hex}"
				onclick={() => actions.onCopy(hex)}
			>
				<span
					class="flex h-12 items-end justify-end p-1.5 font-mono text-[0.66rem]"
					style:background={hex}
					style:color={labelColorOn(hex)}>{hex}</span
				>
				<span class="px-2 py-1.5 text-xs break-all">
					{name}
					<code class="block text-[0.64rem] text-muted-foreground">--{name}</code>
				</span>
			</button>
		</li>
	{/each}
</ul>

<script lang="ts" generics="T extends string">
	import { Check, ChevronDown } from '@lucide/svelte';
	import { Select } from 'bits-ui';
	import { cn } from '#lib/utils/cn.util.ts';

	export type BrandSelectProps<V extends string> = {
		data: { options: { value: V; label: string }[]; value: V };
		/** O rótulo é o nome acessível do gatilho; `prefix` aparece antes do valor (ex.: "Fonte:"). */
		ui: { label: string; prefix?: string; className?: string };
		actions: { onChange: (value: V) => void };
	};

	let { data, ui, actions }: BrandSelectProps<T> = $props();

	const selected = $derived(data.options.find((o) => o.value === data.value));
</script>

<!--
	Select próprio (bits-ui), no lugar do nativo: lista com a cara da marca, teclado completo
	(setas, Home/End, digitar para buscar, Esc) e papéis ARIA de listbox.
-->
<Select.Root
	type="single"
	value={data.value}
	items={data.options}
	onValueChange={(value) => actions.onChange(value as T)}
>
	<Select.Trigger
		aria-label={ui.label}
		class={cn(
			'inline-flex control max-w-full min-w-0 items-center justify-between gap-2 rounded-control border border-border bg-card px-3 text-sm text-foreground hover:border-muted-foreground/60 data-[state=open]:border-primary',
			ui.className
		)}
	>
		<span class="truncate">
			{#if ui.prefix}<span class="text-muted-foreground">{ui.prefix}</span>{/if}
			{selected?.label}
		</span>
		<ChevronDown class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
	</Select.Trigger>
	<Select.Portal>
		<Select.Content
			sideOffset={6}
			class="z-60 max-h-80 min-w-(--bits-select-anchor-width) overflow-hidden rounded-surface border border-border bg-card p-1 shadow-xl shadow-shadow/40"
		>
			<Select.Viewport class="scrollbar-slim">
				{#each data.options as option (option.value)}
					<Select.Item
						value={option.value}
						label={option.label}
						class="flex control cursor-pointer items-center justify-between gap-3 rounded-[calc(var(--radius-control)-2px)] px-2.5 text-sm outline-none data-highlighted:bg-muted data-selected:font-semibold"
					>
						{#snippet children({ selected })}
							<span class="truncate">{option.label}</span>
							{#if selected}<Check
									class="size-4 shrink-0 text-primary-strong"
									aria-hidden="true"
								/>{/if}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
		</Select.Content>
	</Select.Portal>
</Select.Root>

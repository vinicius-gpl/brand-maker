<script lang="ts" generics="T extends string">
	import type { IconComponent } from '#lib/theme/icons.ts';
	import { cn } from '#lib/utils/cn.util.ts';

	export type BrandSegmentedOption<V extends string> = {
		value: V;
		label: string;
		icon?: IconComponent;
	};

	export type BrandSegmentedProps<V extends string> = {
		data: { options: BrandSegmentedOption<V>[]; value: V };
		/** `compact`: no celular só o ícone aparece (o texto continua para leitores de tela). */
		ui: { label: string; compact?: boolean; className?: string };
		actions: { onSelect: (value: V) => void };
	};

	let { data, ui, actions }: BrandSegmentedProps<T> = $props();
</script>

<div
	class={cn('inline-flex rounded-control border border-border bg-card p-0.5', ui.className)}
	role="group"
	aria-label={ui.label}
>
	{#each data.options as option (option.value)}
		{@const pressed = option.value === data.value}
		<button
			type="button"
			class={cn(
				'inline-flex control items-center gap-2 rounded-[calc(var(--radius-control)-2px)] px-3 text-sm whitespace-nowrap text-muted-foreground',
				pressed && 'bg-primary font-semibold text-primary-foreground'
			)}
			aria-pressed={pressed}
			onclick={() => actions.onSelect(option.value)}
		>
			{#if option.icon}<option.icon class="size-4" aria-hidden="true" />{/if}
			<span class={cn(ui.compact && option.icon && 'max-sm:sr-only')}>{option.label}</span>
		</button>
	{/each}
</div>

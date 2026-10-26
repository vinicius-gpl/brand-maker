<script lang="ts">
	import { Check, Moon, Sun, TriangleAlert, X } from '@lucide/svelte';
	import favicon from '#lib/assets/favicon.svg';
	import BrandSegmented from '#lib/components/brand-segmented/brand-segmented.svelte';
	import BrandSelect from '#lib/components/brand-select/brand-select.svelte';
	import { FONTS, NEUTRALS } from '#lib/theme/foundation.ts';
	import type { BrandRuleResult, Mode } from '#lib/types/design.type.ts';
	import { cn } from '#lib/utils/cn.util.ts';

	export type BrandTopbarProps = {
		data: {
			mode: Mode;
			neutralId: string;
			fontId: string;
			/** Nome da fonte que o padrão escolhido recomenda (opção "do padrão"). */
			patternFontName: string;
			rules: BrandRuleResult[];
		};
		actions: {
			onMode: (mode: Mode) => void;
			onNeutral: (id: string) => void;
			onFont: (id: string) => void;
		};
	};

	let { data, actions }: BrandTopbarProps = $props();

	const modeOptions = [
		{ value: 'dark' as const, label: 'Escuro', icon: Moon },
		{ value: 'light' as const, label: 'Claro', icon: Sun }
	];
	const neutralOptions = NEUTRALS.map((n) => ({ value: n.id, label: n.name }));
	const fontOptions = $derived([
		{ value: 'pattern', label: `Do padrão (${data.patternFontName})` },
		...FONTS.map((f) => ({ value: f.id, label: f.name }))
	]);
</script>

<!-- No celular a barra de baixo já ocupa espaço: o topo só fica fixo a partir do tablet. -->
<header class="z-20 border-b border-border bg-background/85 backdrop-blur-md md:sticky md:top-0">
	<div
		class="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-5 gap-y-2.5 px-4 py-3 sm:px-6 md:gap-y-3"
	>
		<a
			href="#editor"
			class="flex items-center gap-2.5 font-heading text-lg font-extrabold tracking-tight"
		>
			<img src={favicon} alt="" class="size-8" />
			Brand Maker
		</a>

		<!-- No celular: logo e modo na primeira linha, selects lado a lado, regras roláveis. -->
		<BrandSegmented
			data={{ options: modeOptions, value: data.mode }}
			ui={{ label: 'Modo', compact: true, className: 'max-md:ml-auto' }}
			actions={{ onSelect: actions.onMode }}
		/>

		<div class="grid min-w-0 grid-cols-2 gap-2 max-md:w-full md:mr-auto md:flex md:items-center">
			<BrandSelect
				data={{ options: neutralOptions, value: data.neutralId }}
				ui={{ label: 'Neutros', prefix: 'Neutro: ', className: 'max-md:w-full' }}
				actions={{ onChange: actions.onNeutral }}
			/>
			<BrandSelect
				data={{ options: fontOptions, value: data.fontId }}
				ui={{ label: 'Tipografia', prefix: 'Fonte: ', className: 'max-md:w-full' }}
				actions={{ onChange: actions.onFont }}
			/>
		</div>

		<ul
			class="-mx-4 scrollbar-none flex gap-1.5 overflow-x-auto fade-x px-4 max-md:w-[calc(100%+2rem)] md:mx-0 md:flex-wrap md:px-0 lg:w-full xl:w-auto"
			aria-label="Regras da marca"
		>
			{#each data.rules as rule (rule.label)}
				<li
					class={cn(
						'inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs whitespace-nowrap',
						!rule.ok && (rule.advisory ? 'border-warning' : 'border-destructive')
					)}
				>
					{#if rule.ok}
						<Check class="size-3.5 text-success" aria-label="ok" />
					{:else if rule.advisory}
						<TriangleAlert class="size-3.5 text-warning" aria-label="aviso" />
					{:else}
						<X class="size-3.5 text-destructive" aria-label="violada" />
					{/if}
					{rule.label}
				</li>
			{/each}
		</ul>
	</div>
</header>

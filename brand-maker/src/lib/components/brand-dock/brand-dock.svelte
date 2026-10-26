<script lang="ts">
	import {
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		Dices,
		Palette,
		Shapes,
		Sparkles
	} from '@lucide/svelte';
	import { Tabs } from 'bits-ui';
	import { cubicOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';
	import BrandChip from '#lib/components/brand-chip/brand-chip.svelte';
	import BrandIconButton from '#lib/components/brand-icon-button/brand-icon-button.svelte';
	import BrandPaletteCarousel from '#lib/components/brand-palette-carousel/brand-palette-carousel.svelte';
	import { STYLES } from '#lib/theme/foundation.ts';
	import { PATTERN_ICONS, STYLE_ICONS } from '#lib/theme/icons.ts';
	import { PATTERNS } from '#lib/theme/patterns.ts';
	import type {
		Mode,
		Neutral,
		PaletteEntry,
		PaletteGroup,
		PatternId,
		VisualStyleId
	} from '#lib/types/design.type.ts';
	import { cn } from '#lib/utils/cn.util.ts';
	import { motionMs } from '#lib/utils/motion.util.ts';
	import { DockMotion } from './dock-motion.svelte.ts';

	export type BrandDockTab = 'padrao' | 'acabamento' | 'cor';

	export type BrandDockProps = {
		data: {
			groups: PaletteGroup[];
			palettes: PaletteEntry[];
			paletteId: string;
			category: string;
			patternId: PatternId;
			styleId: VisualStyleId;
			mode: Mode;
			neutral: Neutral;
		};
		/** `tab`: aba aberta do bottom state. */
		state: { collapsed: boolean; tab: BrandDockTab };
		actions: {
			onPattern: (id: PatternId) => void;
			onStyle: (id: VisualStyleId) => void;
			onCategory: (id: string) => void;
			onPalette: (id: string) => void;
			onStep: (step: number) => void;
			onShuffle: () => void;
			onToggle: () => void;
			onTab: (tab: BrandDockTab) => void;
		};
		/** Altura atual da barra, para a página reservar o espaço embaixo. */
		height?: number;
	};

	let { data, state, actions, height = $bindable(0) }: BrandDockProps = $props();

	const CAROUSEL_ID = 'palette-carousel';
	/** Tempo de abrir e recolher a área de opções. */
	const SLIDE_MS = 280;
	/** Tempo da troca de aba: o conteúdo entra deslizando do lado da aba escolhida. */
	const SWITCH_MS = 220;
	const TABS = [
		{ value: 'padrao', label: 'Padrão', icon: Shapes },
		{ value: 'acabamento', label: 'Acabamento', icon: Sparkles },
		{ value: 'cor', label: 'Cor', icon: Palette }
	] as const;

	const categories = $derived([{ id: 'all', name: 'Todas' }, ...data.groups]);

	const indexOf = (tab: string) => TABS.findIndex((item) => item.value === tab);

	const motion = new DockMotion(TABS.length);
	const indicator = $derived.by(() => {
		void motion.viewport;
		const el = motion.triggers[indexOf(state.tab)];
		return el ? { left: el.offsetLeft, width: el.offsetWidth } : null;
	});

	/** Escolher uma aba com a barra recolhida também a abre. */
	function selectTab(value: string) {
		motion.direction = indexOf(value) >= indexOf(state.tab) ? 1 : -1;
		actions.onTab(value as BrandDockTab);
		if (state.collapsed) actions.onToggle();
	}

	const enter = () => ({
		x: motion.direction * 24,
		duration: motionMs(SWITCH_MS),
		easing: cubicOut
	});

	const rowClass =
		'scrollbar-none fade-x -mx-1 flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto scroll-px-3 px-3 py-1';
</script>

<svelte:window bind:innerWidth={motion.viewport} />

{#snippet key(symbol: string)}
	<kbd class="rounded border border-b-2 border-border px-1 font-mono text-[0.66rem]">{symbol}</kbd>
{/snippet}

<!--
	Bottom sheet com abas: padrão, acabamento e cor, uma escolha por vez (Lei de Hick: menos
	opções na tela ao mesmo tempo). As abas são do bits-ui (setas, Home/End, papéis ARIA).
-->
<aside
	class="fixed inset-x-0 bottom-0 z-30 rounded-t-surface border-t border-border bg-card/90 shadow-[0_-20px_40px_-20px] shadow-background backdrop-blur-lg"
	aria-label="Escolha de padrão, acabamento e cor"
	bind:offsetHeight={height}
>
	<Tabs.Root
		value={state.tab}
		onValueChange={selectTab}
		class="mx-auto max-w-[1320px] px-4 sm:px-6"
	>
		<div class="flex items-center gap-2 pt-2.5 pb-2">
			<Tabs.List
				aria-label="O que escolher"
				class="relative inline-flex rounded-control border border-border bg-background p-0.5"
			>
				<!-- Indicador da aba ativa: desliza e muda de largura até a aba escolhida. -->
				{#if indicator}
					<span
						class="absolute inset-y-0.5 left-0 rounded-[calc(var(--radius-control)-2px)] bg-primary transition-[translate,width] duration-300 ease-out"
						style:translate="{indicator.left}px 0"
						style:width="{indicator.width}px"
						aria-hidden="true"
					></span>
				{/if}
				{#each TABS as item, i (item.value)}
					<Tabs.Trigger
						value={item.value}
						bind:ref={motion.triggers[i]}
						class={cn(
							'relative inline-flex control items-center gap-2 rounded-[calc(var(--radius-control)-2px)] px-2.5 text-sm text-muted-foreground transition-colors duration-300 sm:px-3.5',
							'data-[state=active]:text-primary-foreground',
							!indicator && 'data-[state=active]:bg-primary'
						)}
					>
						<!-- No celular só o texto, para as abas e os botões caberem numa linha. -->
						<item.icon class="size-4 max-sm:hidden" aria-hidden="true" />
						{item.label}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>

			<span class="ml-auto hidden text-xs whitespace-nowrap text-muted-foreground xl:inline">
				{@render key('←')}
				{@render key('→')} cor · {@render key('↑')}
				{@render key('↓')} padrão
			</span>
			<BrandIconButton
				ui={{ label: 'Combinação aleatória', className: 'max-xl:ml-auto' }}
				actions={{ onClick: actions.onShuffle }}><Dices /></BrandIconButton
			>
			<BrandIconButton
				ui={{ label: state.collapsed ? 'Mostrar opções' : 'Recolher opções' }}
				actions={{ onClick: actions.onToggle }}
				aria-expanded={!state.collapsed}
				aria-controls="dock-panels"
				><ChevronDown
					class={cn('transition-transform duration-300 ease-out', state.collapsed && 'rotate-180')}
				/></BrandIconButton
			>
		</div>

		{#if !state.collapsed}
			<!-- Abre e recolhe deslizando; com "reduzir movimento", na hora (motionMs). -->
			<div
				id="dock-panels"
				class="pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
				transition:slide={{ duration: motionMs(SLIDE_MS), easing: cubicOut }}
			>
				<!-- Na troca de aba, a altura anima até a do conteúdo novo. -->
				<div
					class="overflow-hidden transition-[height] duration-300 ease-out"
					style:height={motion.panelHeight ? `${motion.panelHeight}px` : undefined}
				>
					<div bind:offsetHeight={motion.panelHeight}>
						<Tabs.Content value="padrao" class="flex min-w-0">
							<div class={rowClass} role="group" aria-label="Padrão de interface" in:fly={enter()}>
								{#each PATTERNS as pattern (pattern.id)}
									{@const Icon = PATTERN_ICONS[pattern.id]}
									<BrandChip
										ui={{ className: 'snap-start' }}
										state={{ pressed: pattern.id === data.patternId }}
										actions={{ onClick: () => actions.onPattern(pattern.id) }}
									>
										<Icon class="size-4" aria-hidden="true" />{pattern.name}
									</BrandChip>
								{/each}
							</div>
						</Tabs.Content>

						<Tabs.Content value="acabamento" class="flex min-w-0">
							<div class={rowClass} role="group" aria-label="Acabamento" in:fly={enter()}>
								{#each STYLES as style (style.id)}
									{@const Icon = STYLE_ICONS[style.id]}
									<BrandChip
										ui={{ className: 'snap-start' }}
										state={{ pressed: style.id === data.styleId }}
										actions={{ onClick: () => actions.onStyle(style.id) }}
									>
										<Icon class="size-4" aria-hidden="true" />{style.name}
									</BrandChip>
								{/each}
							</div>
						</Tabs.Content>

						<Tabs.Content value="cor" class="min-w-0">
							<div class="grid min-w-0 gap-1" in:fly={enter()}>
								<div class="flex min-w-0 items-center gap-2">
									<div class={rowClass} role="group" aria-label="Categoria de cor">
										{#each categories as group (group.id)}
											<BrandChip
												ui={{ className: 'snap-start' }}
												state={{ pressed: group.id === data.category }}
												actions={{ onClick: () => actions.onCategory(group.id) }}
											>
												{group.name}
											</BrandChip>
										{/each}
									</div>
									<BrandIconButton
										ui={{ label: 'Paleta anterior' }}
										actions={{ onClick: () => actions.onStep(-1) }}><ChevronLeft /></BrandIconButton
									>
									<BrandIconButton
										ui={{ label: 'Próxima paleta' }}
										actions={{ onClick: () => actions.onStep(1) }}><ChevronRight /></BrandIconButton
									>
								</div>
								<BrandPaletteCarousel
									data={{
										palettes: data.palettes,
										paletteId: data.paletteId,
										mode: data.mode,
										neutral: data.neutral
									}}
									ui={{ id: CAROUSEL_ID }}
									actions={{ onSelect: actions.onPalette }}
								/>
							</div>
						</Tabs.Content>
					</div>
				</div>
			</div>
		{/if}
	</Tabs.Root>
</aside>

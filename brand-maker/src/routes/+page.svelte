<script lang="ts">
	import BrandContrastTable from '#lib/components/brand-contrast-table/brand-contrast-table.svelte';
	import BrandDock from '#lib/components/brand-dock/brand-dock.svelte';
	import BrandExpandableScreenContent from '#lib/components/brand-expandable-screen/brand-expandable-screen-content.svelte';
	import BrandExpandableScreenReveal from '#lib/components/brand-expandable-screen/brand-expandable-screen-reveal.svelte';
	import BrandExpandableScreenTrigger from '#lib/components/brand-expandable-screen/brand-expandable-screen-trigger.svelte';
	import BrandExpandableScreen from '#lib/components/brand-expandable-screen/brand-expandable-screen.svelte';
	import BrandFullscreenBar from '#lib/components/brand-fullscreen-bar/brand-fullscreen-bar.svelte';
	import BrandIdentityForm from '#lib/components/brand-identity-form/brand-identity-form.svelte';
	import BrandKeyColors from '#lib/components/brand-key-colors/brand-key-colors.svelte';
	import BrandKitExport from '#lib/components/brand-kit-export/brand-kit-export.svelte';
	import BrandPaletteEditor from '#lib/components/brand-palette-editor/brand-palette-editor.svelte';
	import BrandPreview from '#lib/components/brand-preview/brand-preview.svelte';
	import BrandSection from '#lib/components/brand-section/brand-section.svelte';
	import BrandToast from '#lib/components/brand-toast/brand-toast.svelte';
	import BrandTokenGrid from '#lib/components/brand-token-grid/brand-token-grid.svelte';
	import BrandTopbar from '#lib/components/brand-topbar/brand-topbar.svelte';
	import BrandUxLaws from '#lib/components/brand-ux-laws/brand-ux-laws.svelte';
	import { useDesign } from '#lib/hooks/use-design/use-design.svelte.ts';
	import { useKit } from '#lib/hooks/use-kit/use-kit.svelte.ts';
	import { useToast } from '#lib/hooks/use-toast/use-toast.svelte.ts';
	import { readImageAsDataUrl } from '#lib/utils/file.util.ts';
	import { buildTokens } from '#lib/utils/tokens.util.ts';

	const design = useDesign();
	const kit = useKit(() => design.selection);
	const toast = useToast();

	let dockHeight = $state(0);
	let fullscreen = $state(false);

	const paletteLabel = $derived(
		design.preset ? `${design.palette.name} · ${design.palette.group.name}` : 'Cores personalizadas'
	);

	const darkTokens = $derived(buildTokens(design.palette, 'dark', design.neutral));
	const lightTokens = $derived(buildTokens(design.palette, 'light', design.neutral));

	const copyHex = (hex: string) => toast.copy(hex, `${hex} copiado`);

	async function uploadLogo(file: File) {
		const result = await readImageAsDataUrl(file);
		if (!result.ok) return toast.show(result.error);
		design.setIdentity('logo', result.dataUrl);
	}

	function downloadKit() {
		kit.download();
		toast.show(`${kit.fileName} baixado`);
	}
</script>

<svelte:head>
	<title>{design.brand.name} · Brand Maker</title>
</svelte:head>

<svelte:window onkeydown={design.handleKeydown} />

<BrandTopbar
	data={{
		mode: design.mode,
		neutralId: design.neutralId,
		fontId: design.fontId,
		patternFontName: design.pattern.typography.font.name,
		rules: design.brandRules
	}}
	actions={{
		onMode: design.setMode,
		onNeutral: design.setNeutral,
		onFont: design.setFont
	}}
/>

<main class="mx-auto max-w-[1320px] px-4 pt-6 sm:px-6" style:padding-bottom="{dockHeight + 32}px">
	<div class="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
		<aside
			id="editor"
			class="grid scroll-mt-28 scrollbar-slim gap-6 rounded-surface border border-border bg-card p-5 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem-var(--dock,0px))] lg:overflow-y-auto"
			style:--dock="{dockHeight}px"
			aria-label="Editor da marca"
		>
			<BrandIdentityForm
				data={{ identity: design.identity, slug: design.brand.slug }}
				actions={{ onChange: design.setIdentity, onLogo: uploadLogo }}
			/>
			<BrandPaletteEditor
				data={{ palette: design.palette, colors: design.colors }}
				actions={{
					onColor: design.setColor,
					onHarmony: design.applyHarmony,
					onRandom: design.randomizeColors
				}}
			/>
		</aside>

		<!-- No celular a prévia vem primeiro: é o que a pessoa quer ver ao trocar as opções. -->
		<div class="min-w-0 max-lg:order-first">
			<div class="mb-3">
				<h1 class="font-heading text-xl font-bold sm:text-2xl">{design.brand.name}</h1>
				<p class="mt-1 text-sm text-muted-foreground">
					padrão <b class="text-primary-strong">{design.pattern.name}</b> ·
					<b class="text-primary-strong">{paletteLabel}</b>
					{#if design.styleId !== 'none'}
						· acabamento <b class="text-primary-strong">{design.style.name}</b>
					{/if}
				</p>
			</div>
			<!-- A prévia cresce até a tela cheia (formato ExpandableScreen da cult-ui). -->
			<BrandExpandableScreen
				bind:expanded={fullscreen}
				triggerRadius="var(--radius-surface)"
				contentRadius="0px"
				animationDuration={0.55}
			>
				<BrandExpandableScreenTrigger ui={{ className: 'scroll-mt-28' }}>
					{#snippet children({ expand })}
						<div id="preview">
							<BrandPreview
								data={{ brand: design.brand, pattern: design.pattern, styleId: design.styleId }}
								actions={{ onFullscreen: expand }}
							/>
						</div>
					{/snippet}
				</BrandExpandableScreenTrigger>

				<BrandExpandableScreenContent
					ui={{ label: 'Prévia em tela cheia', showCloseButton: false }}
				>
					<BrandExpandableScreenReveal ui={{ className: 'sticky top-0 z-20' }}>
						<BrandFullscreenBar
							data={{
								brandName: design.brand.name,
								paletteLabel,
								patternName: design.pattern.name,
								mode: design.mode
							}}
							actions={{
								onMode: design.setMode,
								onClose: () => (fullscreen = false)
							}}
						/>
					</BrandExpandableScreenReveal>
					<div style:padding-bottom="{dockHeight}px">
						<BrandPreview
							data={{ brand: design.brand, pattern: design.pattern, styleId: design.styleId }}
							ui={{ chrome: false }}
						/>
					</div>
					<BrandExpandableScreenReveal>
						{@render dock()}
					</BrandExpandableScreenReveal>
				</BrandExpandableScreenContent>
			</BrandExpandableScreen>
		</div>
	</div>

	<BrandSection
		data={{
			id: 'cores',
			title: 'Cores da marca',
			lead: 'Cada cor no escuro e no claro. No claro, o tom de texto (-strong) escurece sozinho até passar no contraste AA. Clique para copiar.'
		}}
	>
		<div class="grid gap-3.5">
			<BrandKeyColors
				data={{ dark: darkTokens, light: lightTokens }}
				actions={{ onCopy: copyHex }}
			/>
			<BrandTokenGrid data={{ tokens: design.tokens }} actions={{ onCopy: copyHex }} />
		</div>
	</BrandSection>

	<BrandSection
		data={{
			id: 'contraste',
			title: 'Contraste (WCAG)',
			lead: 'AA = 4.5 para texto normal, 3.0 para texto grande e ícones. Calculado ao vivo.'
		}}
	>
		<BrandContrastTable data={{ rows: design.contrast, tokens: design.tokens }} />
	</BrandSection>

	<BrandSection
		data={{
			id: 'leis-de-ux',
			title: 'Leis de UX',
			lead: 'Cada lei ligada vira regra na skill e checagem no hook do kit. Os limites ajustados aqui vão para o design.config.json.'
		}}
	>
		<BrandUxLaws
			data={{ settings: design.laws }}
			actions={{ onToggle: design.toggleLaw, onParam: design.setLawParam }}
		/>
	</BrandSection>

	<BrandSection
		data={{
			id: 'kit',
			title: 'Kit de design',
			lead: 'Skills, hooks e scripts .mjs para o agente não sair do design, mais os tokens em CSS e Tailwind e a sua logo. Gerado no navegador.'
		}}
	>
		<BrandKitExport
			data={{ files: kit.files, fileName: kit.fileName }}
			actions={{ onDownload: downloadKit, onCopy: (text) => toast.copy(text) }}
		/>
	</BrandSection>
</main>

<!-- A mesma barra de estilos e paletas serve à página e à tela cheia (uma de cada vez). -->
{#snippet dock()}
	<BrandDock
		bind:height={dockHeight}
		data={{
			groups: design.groups,
			palettes: design.visiblePalettes,
			paletteId: design.presetId ?? '',
			category: design.category,
			patternId: design.patternId,
			styleId: design.styleId,
			mode: design.mode,
			neutral: design.neutral
		}}
		state={{ collapsed: design.dockCollapsed, tab: design.dockTab }}
		actions={{
			onPattern: design.setPattern,
			onStyle: design.setStyle,
			onCategory: design.setCategory,
			onPalette: design.pickPalette,
			onStep: design.stepPalette,
			onShuffle: design.shuffle,
			onToggle: design.toggleDock,
			onTab: design.setDockTab
		}}
	/>
{/snippet}

{#if !fullscreen}
	{@render dock()}
{/if}

<BrandToast data={{ message: toast.message }} state={{ visible: toast.visible }} />

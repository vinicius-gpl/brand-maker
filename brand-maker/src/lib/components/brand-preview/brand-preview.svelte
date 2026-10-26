<script lang="ts">
	import { Maximize2 } from '@lucide/svelte';
	import BrandPreviewMotion from '#lib/components/brand-preview-motion/brand-preview-motion.svelte';
	import BrandWordmark from '#lib/components/brand-wordmark/brand-wordmark.svelte';
	import { patternVars, toStyle } from '#lib/theme/patterns.ts';
	import { PREVIEW_SAMPLE, splitTagline } from '#lib/theme/preview-sample.ts';
	import type { Brand, DesignPattern, VisualStyleId } from '#lib/types/design.type.ts';

	export type BrandPreviewProps = {
		data: { brand: Brand; pattern: DesignPattern; styleId: VisualStyleId };
		/** `chrome: false` tira a moldura de navegador (uso em tela cheia). */
		ui?: { chrome?: boolean };
		/** Com `onFullscreen`, a barra do navegador ganha o botão de tela cheia. */
		actions?: { onFullscreen?: () => void };
	};

	let { data, ui, actions }: BrandPreviewProps = $props();

	const CHART_VALUES = [82, 64, 45, 70, 34];
	const STATUS_SAMPLES = [
		['success', 'ok'],
		['warning', 'aviso'],
		['info', 'info'],
		['destructive', 'erro']
	] as const;

	const content = PREVIEW_SAMPLE;
	const title = $derived(splitTagline(data.brand.tagline));
	const patternStyle = $derived(toStyle(patternVars(data.pattern)));
</script>

<!--
	Um site de exemplo com o padrão, a paleta e o acabamento escolhidos. O padrão chega como
	variáveis --pv-* no style; as classes .pv-* moram em theme/preview/*.css. Os links são
	decorativos (#), a prévia não navega.
-->
{#snippet site()}
	<div
		class="pv"
		data-pattern={data.pattern.id}
		data-style={data.styleId}
		style={patternStyle}
		aria-label="Prévia da marca"
		role="region"
	>
		<header class="pv-nav">
			<BrandWordmark data={{ brand: data.brand }} />
			<nav class="pv-links" aria-label="Menu de exemplo">
				{#each content.nav as item, i (item)}
					<a href="#preview" aria-current={i === 0 ? 'page' : undefined}>{item}</a>
				{/each}
			</nav>
			<button type="button" class="pv-btn pv-btn--ghost">{content.cta}</button>
		</header>

		<section class="pv-hero">
			<p class="pv-eyebrow">{data.brand.name}</p>
			<h3 class="pv-title">{title.before}<mark>{title.highlight}</mark>{title.after}</h3>
			<p class="pv-lead">{data.brand.description}</p>
			<div class="pv-row">
				<button type="button" class="pv-btn pv-btn--primary">{content.actions.primary}</button>
				<button type="button" class="pv-btn pv-btn--accent">{content.actions.accent}</button>
				<button type="button" class="pv-btn pv-btn--ghost">{content.actions.ghost}</button>
			</div>
		</section>

		<div class="pv-body">
			<div class="pv-cards">
				{#each content.cards as card (card.title)}
					<article class="pv-card">
						<span class="pv-badge" data-status={card.status}>{card.label}</span>
						<h4>{card.title}</h4>
						<p>{card.text}</p>
						<ul class="pv-tags">
							{#each card.tags as tag (tag)}<li>{tag}</li>{/each}
						</ul>
					</article>
				{/each}
			</div>

			<div class="pv-split">
				<article class="pv-card">
					<h4 class="pv-card-title">{content.chart.title}</h4>
					<div
						class="pv-bars"
						role="img"
						aria-label="Gráfico de exemplo com as cores chart-1 a chart-5"
					>
						{#each CHART_VALUES as value, i (i)}
							<span style:height="{value}%" style:--bar="var(--chart-{i + 1})"></span>
						{/each}
					</div>
					<ul class="pv-legend">
						{#each content.chart.labels as label, i (label)}
							<li style:--bar="var(--chart-{i + 1})">{label}</li>
						{/each}
					</ul>
				</article>

				<article class="pv-card pv-card--form">
					<h4 class="pv-card-title">{content.form.title}</h4>
					<div class="pv-row pv-row--nowrap">
						<input
							class="pv-input"
							type="email"
							autocomplete="email"
							placeholder={content.form.placeholder}
							aria-label={content.form.title}
						/>
						<button type="button" class="pv-btn pv-btn--ghost">Enviar</button>
					</div>
					<p class="pv-note">
						Texto secundário com um <a class="pv-link" href="#preview">link na cor da marca</a> e
						uma palavra na <strong class="pv-tertiary">terceira cor</strong>.
					</p>
					<div class="pv-row">
						{#each STATUS_SAMPLES as [status, label] (status)}
							<span class="pv-badge" data-status={status}>{label}</span>
						{/each}
						<button type="button" class="pv-btn pv-btn--danger">Excluir</button>
					</div>
				</article>
			</div>
			<BrandPreviewMotion />
		</div>
	</div>
{/snippet}

{#if ui?.chrome === false}
	{@render site()}
{:else}
	<div
		class="overflow-hidden rounded-surface border border-border bg-card shadow-2xl shadow-background/60"
	>
		<div class="flex items-center gap-2.5 border-b border-border bg-muted px-3.5 py-2">
			<span class="flex gap-1.5" aria-hidden="true">
				<i class="size-2.5 rounded-full bg-border"></i><i class="size-2.5 rounded-full bg-border"
				></i><i class="size-2.5 rounded-full bg-border"></i>
			</span>
			<span
				class="min-w-0 flex-1 truncate rounded-md bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground"
				>{content.url(data.brand.slug)}</span
			>
			{#if actions?.onFullscreen}
				<button
					type="button"
					class="inline-flex control shrink-0 items-center gap-1.5 rounded-control border border-border bg-background px-3 text-xs font-semibold hover:border-primary hover:text-primary-strong"
					onclick={actions.onFullscreen}
				>
					<Maximize2 class="size-3.5" aria-hidden="true" /> Tela cheia
				</button>
			{/if}
		</div>
		{@render site()}
	</div>
{/if}

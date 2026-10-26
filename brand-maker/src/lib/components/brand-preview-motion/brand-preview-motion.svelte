<script lang="ts">
	import { Bell, Check, ChevronDown, LoaderCircle } from '@lucide/svelte';
	import { onDestroy } from 'svelte';

	/**
	 * Exemplos que se mexem na prévia: carregando, progresso, esqueleto, switch, abas, acordeão,
	 * notificação, "ao vivo" e "digitando". Tudo usa a forma e o movimento do padrão (variáveis
	 * --pv-*), então a mola do Material e o corte seco do GOV.UK aparecem aqui.
	 */
	const SAVE_STEP_MS = 1600;
	const PERIODS = ['Semana', 'Mês', 'Ano'] as const;
	const PROGRESS = 64;

	let saveState = $state<'idle' | 'saving' | 'saved'>('idle');
	let notifications = $state(true);
	let period = $state(0);
	let timers: ReturnType<typeof setTimeout>[] = [];

	function save() {
		if (saveState !== 'idle') return;
		saveState = 'saving';
		timers = [
			setTimeout(() => (saveState = 'saved'), SAVE_STEP_MS),
			setTimeout(() => (saveState = 'idle'), SAVE_STEP_MS * 2)
		];
	}

	onDestroy(() => timers.forEach(clearTimeout));
</script>

<div class="pv-motion">
	<article class="pv-card pv-card--stack">
		<h4 class="pv-card-title">Carregando</h4>
		<div class="pv-row">
			<button
				type="button"
				class="pv-btn pv-btn--primary pv-btn--icon"
				aria-busy={saveState === 'saving'}
				onclick={save}
			>
				{#if saveState === 'saving'}
					<LoaderCircle class="pv-spin size-4" aria-hidden="true" /> Salvando…
				{:else if saveState === 'saved'}
					<Check class="size-4" aria-hidden="true" /> Salvo
				{:else}
					Salvar alterações
				{/if}
			</button>
			<span class="pv-spinner" role="status" aria-label="Carregando"></span>
		</div>
		<p class="pv-sr-status" role="status" aria-live="polite">
			{saveState === 'saving' ? 'Salvando' : saveState === 'saved' ? 'Alterações salvas' : ''}
		</p>
		<div class="pv-progress-label">
			<span>Enviando arquivos</span><span>{PROGRESS}%</span>
		</div>
		<div
			class="pv-progress"
			role="progressbar"
			aria-label="Enviando arquivos"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={PROGRESS}
		>
			<span style:width="{PROGRESS}%"></span>
		</div>
		<div class="pv-progress pv-progress--indeterminate" role="progressbar" aria-label="Processando">
			<span></span>
		</div>
	</article>

	<article class="pv-card pv-card--stack" aria-busy="true" aria-label="Conteúdo carregando">
		<h4 class="pv-card-title">Esqueleto</h4>
		<div class="pv-skeleton-row">
			<span class="pv-skeleton pv-skeleton--avatar"></span>
			<span class="grid flex-1 gap-2">
				<span class="pv-skeleton w-3/4"></span>
				<span class="pv-skeleton w-1/2"></span>
			</span>
		</div>
		<span class="pv-skeleton pv-skeleton--block"></span>
		<span class="pv-skeleton w-5/6"></span>
	</article>

	<article class="pv-card pv-card--stack">
		<h4 class="pv-card-title">Controles</h4>
		<div class="pv-switch-row">
			<span id="pv-switch-label">Notificações por e-mail</span>
			<button
				type="button"
				role="switch"
				class="pv-switch"
				aria-checked={notifications}
				aria-labelledby="pv-switch-label"
				onclick={() => (notifications = !notifications)}
			>
				<span></span>
			</button>
		</div>
		<div
			class="pv-tabs"
			style:--count={PERIODS.length}
			style:--active={period}
			role="group"
			aria-label="Período"
		>
			<span class="pv-tabs-indicator" aria-hidden="true"></span>
			{#each PERIODS as label, i (label)}
				<button type="button" aria-pressed={period === i} onclick={() => (period = i)}
					>{label}</button
				>
			{/each}
		</div>
		<details class="pv-accordion">
			<summary>
				Como funciona a cobrança?
				<ChevronDown class="pv-accordion-icon size-4" aria-hidden="true" />
			</summary>
			<p>Você paga só pelo que usar no mês, sem fidelidade. Dá para cancelar quando quiser.</p>
		</details>
	</article>

	<article class="pv-card pv-card--stack">
		<h4 class="pv-card-title">Avisos</h4>
		<div class="pv-notice" role="status">
			<Bell class="size-4 shrink-0" aria-hidden="true" />
			<span><b>Nova mensagem</b> de Ana sobre o Projeto Aurora.</span>
		</div>
		<p class="pv-live">
			<span class="pv-live-dot" aria-hidden="true"><span></span></span>
			Ao vivo · 128 pessoas agora
		</p>
		<p class="pv-typing">
			<span class="pv-typing-dots" aria-hidden="true"><span></span><span></span><span></span></span>
			Ana está digitando…
		</p>
	</article>
</div>

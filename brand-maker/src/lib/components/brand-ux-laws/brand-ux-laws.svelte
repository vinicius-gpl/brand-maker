<script lang="ts">
	import { renderPractice, UX_LAWS } from '#lib/theme/ux-laws.ts';
	import type { UxLawId, UxLawSettings } from '#lib/types/design.type.ts';
	import { cn } from '#lib/utils/cn.util.ts';

	export type BrandUxLawsProps = {
		data: { settings: UxLawSettings };
		actions: {
			onToggle: (id: UxLawId) => void;
			onParam: (id: UxLawId, key: string, value: number) => void;
		};
	};

	let { data, actions }: BrandUxLawsProps = $props();
</script>

<ul class="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-3">
	{#each UX_LAWS as law (law.id)}
		{@const setting = data.settings[law.id]}
		<li
			class={cn(
				'flex flex-col gap-3 rounded-surface border border-border bg-card p-4 transition-opacity',
				!setting.enabled && 'border-dashed opacity-60'
			)}
		>
			<div class="flex items-start justify-between gap-3">
				<div>
					<h3 class="font-heading text-base font-bold">{law.name}</h3>
					<p class="mt-0.5 text-sm text-muted-foreground">{law.principle}</p>
				</div>
				<label class="inline-flex control shrink-0 cursor-pointer items-center gap-2 text-sm">
					<input
						type="checkbox"
						class="size-4 accent-[var(--primary)]"
						checked={setting.enabled}
						onchange={() => actions.onToggle(law.id)}
					/>
					{setting.enabled ? 'Ligada' : 'Desligada'}
				</label>
			</div>

			<ul class="list-disc space-y-1 pl-5 text-sm leading-relaxed">
				{#each law.practices as practice (practice)}
					<li>{renderPractice(practice, setting.params)}</li>
				{/each}
			</ul>

			{#if law.params.length}
				<fieldset class="grid gap-2 border-t border-border pt-3" disabled={!setting.enabled}>
					<legend class="sr-only">Limites da {law.name}</legend>
					{#each law.params as param (param.key)}
						<label class="grid grid-cols-[1fr_auto] items-center gap-x-3 text-sm">
							<span>{param.label}</span>
							<output class="font-mono text-sm text-primary-strong"
								>{setting.params[param.key]} {param.unit}</output
							>
							<input
								type="range"
								class="col-span-2 accent-[var(--primary)]"
								min={param.min}
								max={param.max}
								step={param.step}
								value={setting.params[param.key]}
								oninput={(e) => actions.onParam(law.id, param.key, Number(e.currentTarget.value))}
							/>
						</label>
					{/each}
				</fieldset>
			{/if}

			{#if law.checks.length}
				<p class="mt-auto text-xs text-muted-foreground">
					Checagem automática:
					{#each law.checks as check, i (check)}<code class="font-mono text-foreground"
							>{check}</code
						>{i < law.checks.length - 1 ? ', ' : ''}{/each}
				</p>
			{:else}
				<p class="mt-auto text-xs text-muted-foreground">
					Sem checagem automática: revisão humana.
				</p>
			{/if}
		</li>
	{/each}
</ul>

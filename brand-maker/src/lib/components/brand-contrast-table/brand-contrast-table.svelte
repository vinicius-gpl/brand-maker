<script lang="ts">
	import type { ContrastRow, Tokens, WcagLevel } from '#lib/types/design.type.ts';
	import { cn } from '#lib/utils/cn.util.ts';
	import { wcagLevel } from '#lib/utils/tokens.util.ts';

	export type BrandContrastTableProps = { data: { rows: ContrastRow[]; tokens: Tokens } };

	let { data }: BrandContrastTableProps = $props();

	const LEVEL: Record<WcagLevel, { label: string; className: string }> = {
		AAA: { label: 'AAA', className: 'bg-success-soft text-success' },
		AA: { label: 'AA', className: 'bg-success-soft text-success' },
		large: { label: 'só texto grande', className: 'bg-warning-soft text-warning' },
		fail: { label: 'falha', className: 'bg-destructive-soft text-destructive' }
	};
</script>

<div class="overflow-x-auto rounded-surface border border-border bg-card px-3.5 py-1.5">
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="text-left text-xs text-muted-foreground">
				<th class="px-1.5 py-2 font-semibold">Par</th>
				<th class="px-1.5 py-2 font-semibold">Razão</th>
				<th class="px-1.5 py-2 font-semibold">Amostra</th>
				<th class="px-1.5 py-2 font-semibold">Resultado</th>
			</tr>
		</thead>
		<tbody>
			{#each data.rows as row (row.label)}
				{@const level = LEVEL[wcagLevel(row.ratio)]}
				<tr class="border-t border-border whitespace-nowrap">
					<td class="px-1.5 py-2">{row.label}</td>
					<td class="px-1.5 py-2 font-mono">{row.ratio.toFixed(2)}</td>
					<td class="px-1.5 py-2">
						<span
							class="inline-block rounded-md border border-border px-2.5 py-0.5 font-semibold"
							style:color={data.tokens[row.fg]}
							style:background={data.tokens[row.bg]}>Aa texto</span
						>
					</td>
					<td class="px-1.5 py-2">
						<span
							class={cn('rounded-full px-2 py-0.5 font-mono text-xs font-bold', level.className)}
							>{level.label}</span
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

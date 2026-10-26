<script lang="ts">
	import { Copy, Download } from '@lucide/svelte';
	import type { KitFile } from '#lib/types/design.type.ts';
	import { cn } from '#lib/utils/cn.util.ts';

	export type BrandKitExportProps = {
		data: { files: KitFile[]; fileName: string };
		actions: { onDownload: () => void; onCopy: (text: string) => void };
	};

	let { data, actions }: BrandKitExportProps = $props();

	/** Arquivo aberto no visualizador (estado só visual). */
	let openPath = $state('README.md');
	const open = $derived(data.files.find((f) => f.path === openPath) ?? data.files[0]);

	const sizeOf = (file: KitFile) => {
		const bytes = file.binary?.length ?? new TextEncoder().encode(file.content).length;
		return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
	};
</script>

<div class="grid gap-3 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
	<div class="flex min-w-0 flex-col gap-3">
		<button
			type="button"
			class="inline-flex control w-full items-center justify-center gap-2 rounded-control bg-primary px-4 font-semibold text-primary-foreground"
			onclick={actions.onDownload}
		>
			<Download class="size-4" aria-hidden="true" />
			Baixar {data.fileName}
		</button>

		<ul
			class="max-h-[32rem] scrollbar-slim overflow-y-auto rounded-surface border border-border bg-card"
			aria-label="Arquivos do kit"
		>
			{#each data.files as file (file.path)}
				<li class="border-b border-border last:border-b-0">
					<button
						type="button"
						class={cn(
							'flex min-h-10 w-full flex-col gap-0.5 px-3 py-2 text-left',
							file.path === open.path && 'bg-primary-soft'
						)}
						aria-pressed={file.path === open.path}
						onclick={() => (openPath = file.path)}
					>
						<span class="flex w-full items-baseline justify-between gap-2">
							<code class="min-w-0 truncate font-mono text-xs">{file.path}</code>
							<span class="shrink-0 font-mono text-[0.64rem] text-muted-foreground"
								>{sizeOf(file)}</span
							>
						</span>
						<span class="text-xs text-muted-foreground">{file.description}</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>

	<div class="flex min-w-0 flex-col overflow-hidden rounded-surface border border-border bg-card">
		<div class="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
			<code class="min-w-0 truncate font-mono text-xs">{open.path}</code>
			{#if !open.binary}
				<button
					type="button"
					class="inline-flex control shrink-0 items-center gap-1.5 rounded-control border border-border px-3 text-xs font-semibold"
					onclick={() => actions.onCopy(open.content)}
				>
					<Copy class="size-3.5" aria-hidden="true" /> Copiar
				</button>
			{/if}
		</div>
		{#if open.binary}
			<div class="grid min-h-64 place-items-center p-6">
				<img src={open.content} alt="Logo da marca" class="max-h-48 max-w-full object-contain" />
			</div>
		{:else}
			<pre
				class="m-0 max-h-[32rem] scrollbar-slim overflow-auto p-4 font-mono text-xs leading-relaxed">{open.content}</pre>
		{/if}
	</div>
</div>

<script lang="ts">
	import { ImageIcon } from '@lucide/svelte';
	import type { BrandIdentity } from '#lib/types/design.type.ts';
	import { cn } from '#lib/utils/cn.util.ts';
	import { LOGO_TYPES } from '#lib/utils/file.util.ts';

	export type BrandIdentityFormProps = {
		data: { identity: BrandIdentity; slug: string };
		actions: {
			onChange: <K extends keyof BrandIdentity>(key: K, value: BrandIdentity[K]) => void;
			onLogo: (file: File) => void;
		};
	};

	let { data, actions }: BrandIdentityFormProps = $props();

	const fieldClass =
		'w-full rounded-control border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70';
	const labelClass = 'grid gap-1.5 text-sm font-medium';
</script>

<fieldset class="grid gap-3.5">
	<legend class="mb-3 font-heading text-base font-bold">Identidade</legend>

	<label class={labelClass}>
		Nome da marca
		<input
			class={cn('control', fieldClass)}
			value={data.identity.name}
			maxlength="40"
			autocomplete="off"
			spellcheck="false"
			oninput={(e) => actions.onChange('name', e.currentTarget.value)}
		/>
		<span class="text-xs font-normal text-muted-foreground"
			>Arquivos e skill: <code class="font-mono text-foreground">{data.slug}</code></span
		>
	</label>

	<label class={labelClass}>
		Slogan
		<input
			class={cn('control', fieldClass)}
			value={data.identity.tagline}
			maxlength="80"
			autocomplete="off"
			oninput={(e) => actions.onChange('tagline', e.currentTarget.value)}
		/>
		<span class="text-xs font-normal text-muted-foreground"
			>A última palavra vira o destaque do título.</span
		>
	</label>

	<label class={labelClass}>
		Descrição curta
		<textarea
			class={cn('min-h-20 resize-y py-2 leading-relaxed', fieldClass)}
			maxlength="220"
			value={data.identity.description}
			oninput={(e) => actions.onChange('description', e.currentTarget.value)}></textarea>
	</label>

	<div class="grid gap-1.5 text-sm font-medium">
		<span id="logo-label"
			>Logo <span class="font-normal text-muted-foreground">(opcional)</span></span
		>
		<div class="flex items-center gap-3">
			<span
				class="grid size-12 shrink-0 place-items-center overflow-hidden rounded-control border border-dashed border-border bg-background"
			>
				{#if data.identity.logo}
					<img src={data.identity.logo} alt="Logo atual" class="size-full object-contain p-1" />
				{:else}
					<ImageIcon class="size-5 text-muted-foreground" aria-hidden="true" />
				{/if}
			</span>
			<label
				class="inline-flex control cursor-pointer items-center rounded-control border border-border px-3.5 text-sm font-semibold hover:border-primary has-focus-visible:outline-2 has-focus-visible:outline-ring"
			>
				{data.identity.logo ? 'Trocar' : 'Enviar'}
				<input
					type="file"
					class="sr-only"
					accept={LOGO_TYPES.join(',')}
					aria-labelledby="logo-label"
					onchange={(e) => {
						const file = e.currentTarget.files?.[0];
						if (file) actions.onLogo(file);
						e.currentTarget.value = '';
					}}
				/>
			</label>
			{#if data.identity.logo}
				<button
					type="button"
					class="control rounded-control px-3 text-sm text-muted-foreground hover:text-destructive"
					onclick={() => actions.onChange('logo', null)}>Remover</button
				>
			{/if}
		</div>
		<span class="text-xs font-normal text-muted-foreground"
			>SVG, PNG ou WebP até 300 KB. Vai junto no kit.</span
		>
	</div>
</fieldset>

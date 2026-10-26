<script lang="ts">
	import { initials } from '#lib/theme/preview-sample.ts';
	import type { Brand } from '#lib/types/design.type.ts';

	export type BrandWordmarkProps = { data: { brand: Brand } };

	let { data }: BrandWordmarkProps = $props();
</script>

<!-- Marca dentro da prévia: a logo enviada ou, sem logo, um monograma com as iniciais. -->
<span class="pv-wordmark">
	{#if data.brand.logo}
		<img class="pv-wordmark-logo" src={data.brand.logo} alt="" />
	{:else}
		<span class="pv-wordmark-tag" aria-hidden="true">{initials(data.brand.name) || '·'}</span>
	{/if}
	{data.brand.name}
</span>

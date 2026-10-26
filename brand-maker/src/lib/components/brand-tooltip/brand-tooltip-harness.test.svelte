<script lang="ts">
	/** Um botão qualquer com tooltip, para testar o BrandTooltip sozinho. */
	import BrandTooltip from './brand-tooltip.svelte';
</script>

<BrandTooltip ui={{ label: 'Explicação', side: 'bottom' }}>
	{#snippet children({ props })}
		<button type="button" {...props}>Gatilho</button>
	{/snippet}
</BrandTooltip>

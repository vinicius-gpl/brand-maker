<script lang="ts">
	/** Monta as três partes juntas, como na página, para os testes da tela expansível. */
	import BrandExpandableScreenContent from './brand-expandable-screen-content.svelte';
	import BrandExpandableScreenReveal from './brand-expandable-screen-reveal.svelte';
	import BrandExpandableScreenTrigger from './brand-expandable-screen-trigger.svelte';
	import BrandExpandableScreen from './brand-expandable-screen.svelte';

	let {
		showCloseButton = true,
		onExpandChange
	}: { showCloseButton?: boolean; onExpandChange?: (expanded: boolean) => void } = $props();
</script>

<BrandExpandableScreen {onExpandChange}>
	<BrandExpandableScreenTrigger>
		{#snippet children({ expand })}
			<button type="button" onclick={expand}>Tela cheia</button>
		{/snippet}
	</BrandExpandableScreenTrigger>
	<BrandExpandableScreenContent ui={{ label: 'Prévia em tela cheia', showCloseButton }}>
		<p>Conteúdo expandido</p>
		<BrandExpandableScreenReveal ui={{ className: 'sticky top-0' }}>
			<p>Barra da tela cheia</p>
		</BrandExpandableScreenReveal>
	</BrandExpandableScreenContent>
</BrandExpandableScreen>

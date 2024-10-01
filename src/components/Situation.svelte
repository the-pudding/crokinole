<script>
	import Crokinole from "$components/Crokinole.svelte";
	import viewport from "$stores/viewport.js";

	export let scenario;

	const uiHeight = 88;
	const scoreHeight = 39;
	const margin = 64;

	let step = 0;
	let offsetWidth;
	let heights = [];

	$: totalHeight = uiHeight + scoreHeight + margin;
	$: maxHeight = $viewport.height - totalHeight;
	$: width = Math.min(offsetWidth, maxHeight);
</script>

<div class="c">
	<figure bind:offsetWidth>
		{#if offsetWidth}
			<Crokinole {width} tutorial={scenario}></Crokinole>
		{/if}
	</figure>
</div>

<style>
	figure {
		margin: 0 auto 32px;
		width: 100%;
		position: relative;
		min-height: 280px;
	}
</style>

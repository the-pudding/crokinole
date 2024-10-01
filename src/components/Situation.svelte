<script>
	import Crokinole from "$components/Crokinole.svelte";
	import viewport from "$stores/viewport.js";
	import * as S from "$data/specs.js";

	export let scenario;

	let step = 0;
	let offsetWidth;
	let heights = [];

	$: totalHeight = S.uiHeight + S.scoreHeight + S.marginBottom * 2;
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

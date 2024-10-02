<script>
	import { browser } from "$app/environment";
	import Crokinole from "$components/Crokinole.svelte";
	import viewport from "$stores/viewport.js";
	import * as S from "$data/specs.js";

	let el;
	let offsetWidth;

	$: totalHeight = S.uiHeight + S.scoreHeight * 2 + S.marginBottom * 3;
	$: maxHeight = $viewport.height - totalHeight;
	$: width = offsetWidth ? Math.min(offsetWidth - S.marginSide, maxHeight) : 0;
</script>

<figure bind:this={el} bind:offsetWidth width="{width}px">
	{#if offsetWidth}
		<Crokinole {width} game={true}></Crokinole>
	{/if}
</figure>

<style>
	figure {
		aspect-ratio: 1;
		margin: 32px auto;
		position: relative;
	}
</style>

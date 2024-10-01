<script>
	import { browser } from "$app/environment";
	import Crokinole from "$components/Crokinole.svelte";
	import viewport from "$stores/viewport.js";
	import * as S from "$data/specs.js";

	let el;
	let offsetWidth;

	$: totalHeight = S.uiHeight + S.scoreHeight + S.marginBottom;
	$: maxHeight = $viewport.height - totalHeight;
	$: width = Math.min(offsetWidth - S.marginSide, maxHeight);
</script>

<figure bind:this={el} bind:offsetWidth width="{width}px">
	<Crokinole {width} dev={true} ui={true}></Crokinole>
</figure>

<style>
	figure {
		aspect-ratio: 1;
		margin: 32px auto;
		position: relative;
	}
</style>

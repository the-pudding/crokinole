<script>
	import { browser } from "$app/environment";
	import Crokinole from "$components/Crokinole.svelte";
	import viewport from "$stores/viewport.js";

	let el;
	let offsetWidth;
	let width;

	function resize() {
		width = offsetWidth;
	}

	$: hasWidth = offsetWidth !== undefined;
	$: if (hasWidth) resize($viewport.width);
</script>

<div bind:this={el} bind:offsetWidth>
	<Crokinole {width} dev={true}></Crokinole>
</div>

<style>
	div {
		width: calc(min(100svw, 100svh) * 0.7);
		height: calc(min(100svw, 100svh) * 0.7);
		margin: 0 auto;
	}
</style>

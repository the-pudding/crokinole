<script>
	import { onMount } from "svelte";
	import * as C from "$utils/crokinole.js";

	export let width;
	export let dev;
	let element;
	let isDragging;
	let mousePosition;
	let x = 0;
	let y = 0;

	function onMousedown(event) {
		if (!dev) return;

		// if (!activeDisc) return;
		isDragging = true;
		mousePosition = { x: event.offsetX, y: event.offsetY };
	}

	function onMousemove(event) {
		if (!isDragging) return;
		mousePosition = { x: event.offsetX, y: event.offsetY };
	}

	function onMouseup() {
		isDragging = false;
		// if (!activeDisc) return;
	}

	function onClick(event) {
		if (!dev) return;
		const x = event.offsetX;
		const y = event.offsetY;

		C.select({ x, y });
	}

	function onAdd() {
		C.addDisc({ player: "player1" });
	}

	function onFlick() {
		C.flickDisc({});
	}

	function onScenario() {
		[
			{ x: 0.7, y: 0.5, player: "player1" },
			{ x: 0.4, y: 0.4, player: "player2" },
			{}
		].forEach(C.addDisc);
	}

	$: x = mousePosition ? (mousePosition.x / width).toFixed(2) : 0;
	$: y = mousePosition ? (mousePosition.y / width).toFixed(2) : 0;
	onMount(() => {
		C.init({ element, width });
	});
</script>

<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="c"
	bind:this={element}
	on:click={onClick}
	on:mousedown={onMousedown}
	on:mousemove={onMousemove}
	on:mouseup={onMouseup}
></div>

{#if dev}
	<p>x: {x}, y: {y}</p>

	<div>
		<button on:click={onFlick}>Flick Disc</button>
		<button on:click={onAdd}>Add Disc</button>
		<button on:click={onScenario}>Scenario</button>
	</div>
{/if}

<style>
	.c {
		display: flex;
		justify-content: center;
	}

	p {
		margin: 0;
		font-size: 14px;
		text-align: center;
	}
</style>

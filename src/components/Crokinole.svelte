<script>
	import { onMount } from "svelte";
	import C from "$utils/crokinole.js";
	import * as S from "$data/specs.js";
	import UI from "$components/Crokinole.UI.svelte";

	export let width;
	export let ui;
	export let dev;

	const crokinole = C();
	const angles = [45, 135, 225, 315];

	let element;
	let isDragging;
	let target;
	let x = 0;
	let y = 0;

	let turn = 0;
	let rangeValue;
	let phase = "place";

	function onMousedown(event) {
		if (!dev) return;

		// if (!activeDisc) return;
		isDragging = true;
		// target = { x: event.offsetX, y: event.offsetY };
	}

	function onMousemove(event) {
		if (!isDragging) return;
		target = { x: event.offsetX, y: event.offsetY };
		crokinole.drag(target);
	}

	function onMouseup() {
		isDragging = false;
		crokinole.flickDisc();
		// if (!activeDisc) return;
	}

	function onClick(event) {
		if (!dev) return;
		const x = event.offsetX;
		const y = event.offsetY;

		// crokinole.select({ x, y });
	}

	function addDisc() {
		crokinole.addDisc({ player: "player1", mode: "place" });
	}

	function onFlick() {
		crokinole.flickDisc({ target: { x: 0.5, y: 0.5 }, speed: 0.4 });
	}

	function onScenario() {
		[
			{ x: 0.7, y: 0.5, player: "player1" },
			{ x: 0.45, y: 0.48, player: "player2" },
			{ mode: "shoot" }
		].forEach(crokinole.addDisc);
	}

	function onShotComplete(data) {
		console.log(data);
	}

	function onAim() {
		crokinole.setMode("shoot");
	}

	function updateRange() {
		target = { x: rangeValue[0] * width, y: 0 };
		crokinole.drag(target);
	}

	function onPhaseClick() {
		if (phase === "place") {
			phase = "aim";
			crokinole.setMode("aim");
		} else if (phase === "aim") {
			phase = "shoot";
			crokinole.setMode("shoot");
		}
	}

	$: buttonText = phase === "place" ? "Aim" : "Shoot";
	$: x = target ? (target.x / width).toFixed(2) : 0;
	$: y = target ? (target.y / width).toFixed(2) : 0;
	$: if (width) crokinole.init({ element, width });
	$: if (width) updateRange(rangeValue);

	onMount(() => {
		crokinole.on("ready", addDisc);
		crokinole.on("shotComplete", onShotComplete);
	});
</script>

<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="c">
	<div class="bg" style:width="{width}px" style:height="{width}px">
		<div
			class="base"
			style="--w: {S.base * width}px; --b: {(S.rimWidth / 2) * width}px;"
		></div>
		<div class="surface" style="--w: {S.surface * width}px;"></div>
		<div
			class="five"
			style="--w: {Math.floor(S.five * width)}px; --b: {((S.five - S.ten) / 2) *
				width}px"
		></div>

		<div
			class="ten"
			style="--w: {Math.floor(S.ten * width)}px; --b: {((S.ten - S.fifteen) /
				2) *
				width}px"
		></div>

		<div
			class="fifteen"
			style="--w: {Math.floor(S.fifteen * width)}px; --b: {((S.fifteen -
				S.twenty) /
				2) *
				width}px"
		></div>

		<div class="twenty" style="--w: {Math.floor(S.twenty * width)}px;"></div>

		{#each angles as angle}
			<div
				class="quadrant-line"
				style="--w: {((S.five - S.ten) * width) / 2}px; --x: {(S.ten * width) /
					2}px; --angle: {angle}deg;"
			></div>
		{/each}
	</div>
	<div
		class="fg"
		bind:this={element}
		on:click={onClick}
		on:mousedown={onMousedown}
		on:mousemove={onMousemove}
		on:mouseup={onMouseup}
	></div>
</div>

{#if ui}
	<div class="ui">
		<div class="top">
			<UI {phase} bind:value={rangeValue}></UI>
		</div>
		<div class="bottom">
			{#if phase !== "shoot"}
				<button on:click={onPhaseClick}>{buttonText}</button>
			{/if}
		</div>
	</div>
{/if}
<!-- <input type="range" min={0.21} max={0.79} step={0.01} /> -->

{#if dev}
	<p>x: {x}, y: {y}</p>

	<!-- <div>
		<button on:click={onFlick}>Flick Disc</button>
		<button on:click={onAdd}>Add Disc</button>
		<button on:click={onScenario}>Scenario</button>
		<button on:click={onAim}>Aim/Shoot</button>
	</div> -->
{/if}

<style>
	.c {
		position: relative;
		display: flex;
		justify-content: center;
		--color-line: var(--color-gray-200);
		--color-board: var(--color-white);
		--color-ditch: var(--color-gray-200);
		--color-rim: var(--color-gray-400);
		--outline-width: 2px;
	}

	.bg {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.fg {
		position: relative;
	}

	.bg > div {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: var(--w);
		height: var(--w);
		border-width: var(--b);
		border-style: solid;
		border-radius: 50%;
	}

	.bg .base {
		border: none;
		background: var(--color-ditch);
		outline: var(--b) solid var(--color-rim);
	}

	.bg .surface {
		border: none;
		background: var(--color-board);
	}

	.five {
		border-color: var(--color-board);
		outline: var(--outline-width) solid var(--color-line);
	}

	.ten {
		border-color: var(--color-board);
		outline: var(--outline-width) solid var(--color-line);
	}

	.fifteen {
		border-color: var(--color-board);
		outline: var(--outline-width) solid var(--color-line);
	}

	.bg .twenty {
		background: var(--color-ditch);
		border: none;
	}

	.bg .quadrant-line {
		transform-origin: 0 0;
		transform: rotate(var(--angle)) translate(var(--x), -1px);
		width: var(--w);
		height: var(--outline-width);
		border: none;
		background: var(--color-line);
		border-radius: 0;
	}

	p {
		margin: 0;
		font-size: 14px;
		text-align: center;
	}

	.ui {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.ui > div {
		height: 32px;
		display: flex;
		justify-content: center;
		width: 100%;
		margin: 4px 0;
	}

	.bottom button {
		padding: 0;
		width: 10em;
		font-size: var(--14px);
		text-transform: uppercase;
		font-weight: bold;
		height: 100%;
	}

	.bottom p {
		text-align: center;
		font-size: var(--14px);
		text-transform: uppercase;
		font-weight: bold;
	}
</style>

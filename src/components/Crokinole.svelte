<script>
	import { onMount } from "svelte";
	import C from "$utils/crokinole.js";
	import * as S from "$data/specs.js";
	import Slider from "$components/Crokinole.Slider.svelte";
	import Button from "$components/Crokinole.Button.svelte";

	export let width;
	export let ui;
	export let dev;
	export let tutorial;

	const crokinole = C();
	const angles = [45, 135, 225, 315];
	const pegs = [15, 60, 105, 150, 195, 240, 285, 330];
	const regions = ["five", "ten", "fifteen", "twenty"];
	const regionText = {
		five: "5",
		ten: "10",
		fifteen: "15",
		twenty: "20"
	};
	const rangeDefault = {
		place: {
			value: [0.5],
			min: 0.22,
			max: 0.78,
			step: 0.01
		},
		aim: {
			value: [0],
			min: -90,
			max: 90,
			step: 1
		}
	};

	let element;
	let isDragging;
	let target;
	let x = 0;
	let y = 0;
	let uiVisible;

	let turn = 0;
	let rangeValue = rangeDefault.place.value;
	let power = 0.5;
	let phase = "place";
	let degrees;

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

	// just for dev
	function onClick(event) {
		if (!dev) return;
		const x = event.offsetX;
		const y = event.offsetY;

		// crokinole.select({ x, y });
	}

	function addDisc() {
		crokinole.addDisc({ player: "player1", state: "place" });
	}

	function onFlick() {
		crokinole.flickDisc({ target: { x: 0.5, y: 0.5 }, speed: 0.4 });
	}

	function onScenario() {
		[
			{ x: 0.7, y: 0.5, player: "player1" },
			{ x: 0.45, y: 0.48, player: "player2" },
			{ state: "shoot" }
		].forEach(crokinole.addDisc);
	}

	function onShotComplete(data) {
		console.log(data);
	}

	function onAim() {
		crokinole.setState("shoot");
	}

	function onRelease() {
		crokinole.flickDisc({ degrees, power });
	}

	function updateRange() {
		if (phase === "place") crokinole.placeDisc(rangeValue[0] * width);
		else if (phase === "aim") {
			degrees = Math.round(rangeValue[0]);
			crokinole.aimDisc({ degrees, power: 0.5 });
		}
	}

	function updatePower() {
		crokinole.aimDisc({ degrees, power });
	}

	function onPhaseClick() {
		if (phase === "place") {
			phase = "aim";
			rangeValue = rangeDefault.aim.value;
			crokinole.setState("aim");
		} else if (phase === "aim") {
			phase = "shoot";
			crokinole.setState("shoot");
		}
	}

	function updateTutorial() {
		crokinole.removeDiscs();
		uiVisible = true;
		if (tutorial !== "regions") addDisc();
		else uiVisible = false;
	}

	$: buttonText = phase === "place" ? "Place" : "Aim";
	$: x = target ? (target.x / width).toFixed(2) : 0;
	$: y = target ? (target.y / width).toFixed(2) : 0;
	$: if (width) crokinole.init({ element, width });
	$: if (width) updateRange(rangeValue);
	$: if (width) updatePower(power);
	$: if (width) updateTutorial(tutorial);
	$: tutorialClass = tutorial ? `tutorial-${tutorial}` : "";

	onMount(() => {
		// crokinole.on("ready", addDisc);
		crokinole.on("shotComplete", onShotComplete);
	});
</script>

<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="c {tutorialClass}">
	<div class="bg" style:width="{width}px" style:height="{width}px">
		<div
			class="base"
			style="--w: {S.base * width}px; --b: {(S.rimWidth / 2) * width}px;"
		></div>

		<div class="surface" style="--w: {S.surface * width}px;"></div>

		{#each regions.slice(0, 3) as region, i}
			<div
				class={region}
				style="--w: {Math.floor(S[region] * width)}px; --b: {((S[region] -
					S[regions[i + 1]]) /
					2) *
					width}px"
			></div>
		{/each}

		<div class="twenty" style="--w: {Math.floor(S.twenty * width)}px;"></div>

		{#each regions as region}
			{@const text = regionText[region]}
			<span
				class="text-{region}"
				style="--w: {Math.floor(width / 2 - (S[region] * width) / 2)}px;"
				>{text}</span
			>
		{/each}

		{#each angles as angle}
			<div
				class="quadrant-line"
				style="--w: {((S.five - S.ten) * width) / 2}px; --x: {(S.ten * width) /
					2}px; --angle: {angle}deg;"
			></div>
		{/each}

		{#each pegs as peg}
			<div
				class="peg"
				style="--w: {S.peg * width}px; --x: {((S.fifteen - S.peg) * width) /
					2}px; --angle: {peg}deg;"
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
	<div class="ui" class:visible={uiVisible}>
		<div class="top">
			{#if phase === "shoot"}
				<Button bind:value={power} on:release={onRelease}></Button>
			{:else}<button on:click={onPhaseClick}>{buttonText}</button>
			{/if}
		</div>
		{#if ["place", "aim"].includes(phase)}
			<div class="bottom">
				<Slider
					{phase}
					min={rangeDefault[phase]?.min}
					max={rangeDefault[phase]?.max}
					step={rangeDefault[phase]?.step}
					bind:value={rangeValue}
				></Slider>
			</div>
		{/if}
	</div>
{/if}

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
		width: 100%;
		height: 100%;
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
		pointer-events: none;
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
		transition: border-color 0.2s;
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

	.bg .peg {
		transform-origin: 0 0;
		transform: rotate(var(--angle))
			translate(calc(var(--x) - 1px), calc(var(--w) - 2px));
		width: var(--w);
		border: none;
		background: var(--color-rim);
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
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s;
	}

	.ui.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.ui > div {
		height: 32px;
		display: flex;
		justify-content: center;
		width: 100%;
		margin: 8px 0 4px 0;
	}

	:global(.ui button) {
		padding: 0;
		width: 12em;
		text-transform: uppercase;
		height: 100%;
	}

	.bottom p {
		text-align: center;
		font-size: var(--14px);
		text-transform: uppercase;
		font-weight: bold;
	}

	span {
		opacity: 0;
		transition: opacity 0.2s;
		position: absolute;
		top: var(--w);
		left: 50%;
		transform: translate(-50%, 25%);
	}

	.tutorial-regions span {
		opacity: 1;
		font-family: var(--sans);
		font-weight: bold;
		font-size: var(--16px);
	}

	.tutorial-regions .five {
		border-color: var(--color-purple-aaa);
	}

	.tutorial-regions .ten {
		border-color: var(--color-red-aa);
	}

	.tutorial-regions .fifteen {
		border-color: var(--color-teal-aa);
	}

	.tutorial-regions .twenty {
		background: var(--color-fg);
	}

	span.text-five {
		color: var(--color-bg);
	}

	span.text-twenty {
		transform: translate(-50%, 125%);
	}

	.tutorial-open .fifteen {
		border-color: var(--color-fg);
	}
</style>

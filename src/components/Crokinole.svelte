<script>
	import { tick, onMount } from "svelte";
	import C from "$utils/crokinole.js";
	import * as S from "$data/specs.js";
	import Slider from "$components/Crokinole.Slider.svelte";
	import Button from "$components/Crokinole.Button.svelte";
	import scenarios from "$data/scenarios.json";

	export let width;
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

	const powerDefault = 0;

	const rangeDefault = {
		position: {
			value: [0.5],
			min: 0.22,
			max: 0.78,
			step: 0.01
		},
		shoot: {
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

	let turn = 0;
	let rangeValue = rangeDefault.position.value;
	let power = powerDefault;
	let phase = "position";
	let degrees;
	let disabled;
	let replay;
	let uiVisible;
	let autoplayTimeout;

	// just for dev
	function onClick(event) {
		if (!dev) return;
		x = event.offsetX / width;
		y = event.offsetY / width;

		// crokinole.select({ x, y });
	}

	function onShotComplete({ scores, valid }) {
		power = powerDefault;
	}

	function onShotCompleteManual({ discs, valid }) {
		console.log(discs);
		if (tutorial) updateTutorial();
		disabled = false;
	}

	function onRelease() {
		crokinole.flickDisc();
	}

	function updateRange() {
		if (phase === "position") crokinole.positionDisc(rangeValue[0] * width);
		else if (phase === "shoot") {
			degrees = Math.round(rangeValue[0]);
			crokinole.aimDisc({
				degrees,
				power: 0.25,
				visible: tutorial.includes("try")
			});
		}
	}

	function updatePower() {
		crokinole.aimDisc({ degrees, power, visible: tutorial.includes("try") });
	}

	function onPhaseClick() {
		if (phase === "position") {
			phase = "shoot";
			rangeValue = rangeDefault.shoot.value;
			power = powerDefault;
			crokinole.setState("shoot");
		}
	}

	// function onReplay() {
	// crokinole.removeDiscs();
	// updateTutorial(tutorial, 2000);
	// }

	async function updateTutorial() {
		clearTimeout(autoplayTimeout);
		replay = !tutorial.includes("try");
		uiVisible = !["regions", "score"].includes(tutorial);
		power = powerDefault;
		const s = scenarios[tutorial];

		crokinole.removeDiscs();
		if (s) s.forEach(crokinole.addDisc);

		if (replay && s) {
			const shooter = s[s.length - 1];
			const rd = shooter.random ? Math.random() * 3 - 1.5 : 0;
			const d = shooter.degrees + rd;
			const rp = shooter.random ? Math.random() * 0.07 - 0.035 : 0;
			const p = shooter.power + rp;

			autoplayTimeout = setTimeout(() => {
				phase = s[s.length - 1].state;
				crokinole.aimDisc({
					degrees: d,
					power: p
				});
				crokinole.flickDisc();
			}, 2000);
		} else {
			autoplayTimeout = null;
			crokinole.removeDiscs();
			if (s) {
				s.forEach(crokinole.addDisc);
				phase = s[s.length - 1].state;
			}
			if (phase === "shoot") crokinole.setIndicatorVisible(true);
		}

		await tick();
		rangeValue = rangeDefault[phase].value;
	}

	$: buttonText = phase === "position" ? "Place Disc" : "";
	$: x = target ? (target.x / width).toFixed(2) : 0;
	$: y = target ? (target.y / width).toFixed(2) : 0;
	$: if (width) crokinole.init({ element, width, tutorial });
	$: if (width) updateRange(rangeValue);
	$: if (width) updatePower(power);
	$: if (width) updateTutorial(tutorial);
	$: tutorialClass = tutorial ? `tutorial tutorial-${tutorial}` : "";

	onMount(() => {
		crokinole.on("shotComplete", onShotComplete);
		crokinole.on("shotCompleteManual", onShotCompleteManual);
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
				style="--w: {Math.floor(
					width / 2 - (S[region] * width) / 2
				)}px; --d: {S[region] * width}px;">{text}</span
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
				style="--w: {S.peg * width}px; --x: {((S.fifteen - S.peg) * width + 1) /
					2}px; --angle: {peg}deg;"
			></div>
		{/each}
	</div>
	<div class="fg" bind:this={element} on:click={onClick}></div>
</div>

<div class="ui" class:visible={uiVisible || !tutorial}>
	<div class="top">
		<!-- {#if replay}
			<button disabled={replayDisabled} on:click={onReplay}>Replay</button> -->
		{#if !replay}
			{#if phase === "shoot"}
				<Button {disabled} bind:value={power} on:release={onRelease}></Button>
			{:else}
				<button on:click={onPhaseClick}>{buttonText}</button>
			{/if}
		{/if}
	</div>

	<div class="bottom">
		{#if !replay}
			<Slider
				label={phase === "shoot" ? "aim" : phase}
				min={rangeDefault[phase]?.min}
				max={rangeDefault[phase]?.max}
				step={rangeDefault[phase]?.step}
				bind:value={rangeValue}
			></Slider>
		{/if}
		<!-- <p><em>Press for power and release to shoot</em></p> -->
	</div>
</div>

{#if dev}
	<p>x: {x}, y: {y}</p>
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
		--color-peg: var(--color-gray-600);
		--outline-width: 2px;
		user-select: none;
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
		background: var(--color-peg);
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
		user-select: none;
	}

	.ui.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.ui > div {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.ui .top {
		height: 40px;
		margin-top: 8px;
		margin-bottom: 8px;
	}

	.ui .bottom {
		height: 32px;
	}

	.ui .bottom p {
		margin: 0;
		font-family: var(--sans);
		text-align: center;
		font-size: var(--14px);
	}

	:global(.ui button) {
		padding: 0;
		width: 10em;
		text-transform: uppercase;
		height: 100%;
	}

	span {
		opacity: 0;
		transition: opacity 0.2s;
		position: absolute;
		top: var(--w);
		left: 50%;
		transform: translate(-50%, 8px);
		color: var(--color-fg-light);
	}

	.tutorial span {
		opacity: 1;
		font-family: var(--sans);
		font-weight: bold;
		font-size: var(--16px);
	}

	.tutorial-regions .five {
		border-color: var(--color-red-aa);
	}

	.tutorial-regions .ten {
		border-color: var(--color-teal-aa);
	}

	.tutorial-regions .fifteen,
	.tutorial-fifteen .fifteen {
		border-color: var(--color-purple-aaa);
	}

	.tutorial span {
		color: var(--color-fg-light);
	}

	.tutorial span.text-twenty {
		transform: translate(-50%, calc(var(--d) + 4px));
	}

	.tutorial-regions span {
		color: var(--color-fg-dark);
	}

	.tutorial-regions span.text-fifteen,
	.tutorial-regions span.text-twenty,
	.tutorial-fifteen span.text-fifteen,
	.tutorial-fifteen span.text-twenty {
		color: var(--color-bg);
	}
</style>

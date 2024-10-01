<script>
	import { tick, onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { format } from "d3";
	import C from "$utils/crokinole.js";
	import * as S from "$data/specs.js";
	import Slider from "$components/Crokinole.Slider.svelte";
	import Button from "$components/Crokinole.Button.svelte";
	import scenarios from "$data/scenarios.json";

	export let width;
	export let dev;
	export let tutorial;
	export let autoMute;

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
			value: [0.5 * S.boardR * 2],
			min: 0.21 * S.boardR * 2,
			max: 0.79 * S.boardR * 2,
			step: 1
		},
		shoot: {
			value: [0],
			min: -90,
			max: 90,
			step: 0.25
		}
	};

	const holder = { player1: 0, player2: 0 };
	const score = { player1: 0, player2: 0, leader: "" };
	const animate = { player1: false, player2: false };

	let element;
	let isDragging;
	let target;
	let x = 0;
	let y = 0;

	let ready;
	let turn = 0;
	let rangeValuePosition = rangeDefault.position.value;
	let rangeValueShoot = rangeDefault.shoot.value;
	// let rangeMin = rangeDefault.position.min;
	// let rangeMax = rangeDefault.position.max;
	// let rangeStep = rangeDefault.position.step;
	let power = powerDefault;
	let phase = "position";
	let degrees = 0;
	let disabled;
	let replay;
	let uiVisible;
	let autoplayTimeout;
	let replayTimeout;
	let reactTimeout;
	let pointsVisible = true;
	let holderVisible = true;
	let animateSlider;
	let sliderAnimated;
	let reactText;

	// just for dev
	function onClick(event) {
		if (!dev) return;
		x = event.offsetX / width;
		y = event.offsetY / width;

		// crokinole.select({ x, y });
	}

	function onShotComplete({ discs, valid }) {
		power = powerDefault;
	}

	function react({ discs, valid }) {
		if (valid) {
			// scored 20
			const scored20 = discs.some((disc) => disc.score === 20);
			const allOpp0 = discs
				.filter((d) => d.player === "player2")
				.every((disc) => disc.score === 0);
			const goal20 = tutorial.includes("open");
			const goalTriple = tutorial.includes("triple");
			const custom = goal20
				? scored20
					? "Nice 20!"
					: "But not a 20 :("
				: goalTriple
					? allOpp0
						? "Triple takeout!"
						: "But not a triple takeout :("
					: "Well done!";
			reactText = `Valid shot. ${custom}`;
		} else {
			reactText = "Invalid shot. Try again.";
		}
		clearTimeout(reactTimeout);
		reactTimeout = setTimeout(() => {
			reactText = null;
			updateTutorial();
		}, 2000);
	}

	function endRound() {
		phase = "end";
		reactText = `${score.player1 > score.player2 ? "You" : "Opp."} win the round`;
	}

	function updateScore(discs) {
		// add discs to score

		discs.forEach((disc) => {
			if (disc.valid && disc.score) score[disc.player] += disc.score;
			if (disc.valid && disc.score === 20) {
				animate[disc.player] = true;
				holder[disc.player]++;
			}
		});
	}

	function onShotCompleteManual({ discs, valid }) {
		resetScore();
		updateScore(discs);
		power = powerDefault;
		if (tutorial.includes("try")) react({ discs, valid });
		else if (tutorial) replayTimeout = setTimeout(updateTutorial, 2000);
	}

	function onRelease() {
		animate.player1 = false;
		animate.player2 = false;
		crokinole.flickDisc();
		disabled = true;
	}

	function resetRanges() {
		rangeValuePosition = rangeDefault.position.value;
		rangeValueShoot = rangeDefault.shoot.value;
	}

	function updateRangePosition() {
		if (phase !== "position") return;
		if (!sliderAnimated) {
			sliderAnimated = rangeValuePosition[0] !== rangeDefault.position.value[0];
			animateSlider = !sliderAnimated;
		}
		crokinole.positionDisc(rangeValuePosition[0]);
	}

	function updateRangeShoot() {
		if (phase !== "shoot") return;
		const visible = tutorial ? tutorial.includes("try") : true;
		degrees = rangeValueShoot[0];
		crokinole.aimDisc({
			degrees,
			power: 0.25,
			visible
		});
	}

	function updatePower() {
		const visible = tutorial ? tutorial.includes("try") : true;
		crokinole.aimDisc({ degrees, power, visible });
	}

	async function onPhaseClick() {
		if (phase === "position") {
			phase = "shoot";
			power = powerDefault;
			resetRanges();
			crokinole.setState("shoot");
		}
	}

	function resetScore() {
		holder.player1 = 0;
		holder.player2 = 0;
		score.player1 = 0;
		score.player2 = 0;
	}

	async function updateTutorial() {
		resetScore();
		clearTimeout(autoplayTimeout);
		clearTimeout(replayTimeout);
		clearTimeout(reactTimeout);
		reactText = null;
		replay = !tutorial.includes("try");
		uiVisible = !["regions", "score"].includes(tutorial);
		const end = tutorial === "score";
		pointsVisible = !["regions", "tripletry"].includes(tutorial);
		holderVisible = pointsVisible;
		animateSlider = tutorial === "opponenttry" && !sliderAnimated;
		power = powerDefault;
		const s = scenarios[tutorial];

		crokinole.removeDiscs();
		if (s) s.forEach(crokinole.addDisc);
		s.forEach((s) => (s.valid = true));
		updateScore(s);

		if ((replay || end) && s) {
			const shooter = s[s.length - 1];
			const rd = shooter.random ? Math.random() * 3 - 1.5 : 0;
			const d = shooter.degrees + rd;
			const rp = shooter.random ? Math.random() * 0.07 - 0.035 : 0;
			const p = shooter.power + rp;

			autoplayTimeout = setTimeout(() => {
				if (end) endRound();
				else {
					phase = s[s.length - 1].state;
					crokinole.aimDisc({
						degrees: d,
						power: p
					});
					onRelease();
				}
			}, 2000);
		} else {
			autoplayTimeout = null;
			if (s) phase = s[s.length - 1].state;
			if (phase === "shoot") crokinole.setIndicatorVisible(true);
		}

		// reset ranges
		resetRanges();
		disabled = false;
	}

	$: x = target ? (target.x / width).toFixed(2) : 0;
	$: y = target ? (target.y / width).toFixed(2) : 0;
	$: tutorialClass = tutorial ? `tutorial tutorial-${tutorial}` : "";
	$: if (ready) crokinole.resize(width);
	$: if (ready) updateRangePosition(rangeValuePosition, width);
	$: if (ready) updateRangeShoot(rangeValueShoot, width);
	$: if (ready) updatePower(power, width);
	$: if (ready) updateTutorial(tutorial);
	$: crokinole.autoMute(autoMute);

	onMount(() => {
		crokinole.on("shotComplete", onShotComplete);
		crokinole.on("shotCompleteManual", onShotCompleteManual);
		crokinole.on("ready", () => (ready = true));
		crokinole.init({ element, width, tutorial });
		if (dev) crokinole.addDisc();
	});
</script>

<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="score" style:width="{width}px">
	<p
		class="holder you"
		class:animate={animate.player1}
		class:visible={holderVisible}
	>
		<span class="label">20s</span>
		<strong>{holder.player1}</strong>
	</p>
	<p class="points" class:visible={pointsVisible}>
		<span class="label">POINTS</span>
		<strong
			><span class="you">{score.player1}</span> -
			<span class="opp">{score.player2}</span></strong
		>
	</p>
	<p
		class="holder opp"
		class:animate={animate.player2}
		class:visible={holderVisible}
	>
		<span class="label">20s</span>
		<strong>{holder.player2}</strong>
	</p>
</div>

<div class="c {tutorialClass}">
	<div class="bg" style:width="{width}px" style:height="{width}px">
		<div
			class="base"
			style="--w: {((S.baseR - S.rimW) / S.boardR) * width}px; --b: {(S.rimW /
				S.boardR) *
				width}px;"
		></div>

		<div
			class="surface"
			style="--w: {(S.surfaceR / S.boardR) * width}px;"
		></div>

		{#each regions.slice(0, 3) as region, i}
			{@const regionW = S[`${region}R`]}
			{@const nextRegionW = S[`${regions[i + 1]}R`]}
			{@const outerW = (regionW / S.boardR) * width}
			{@const innerW = (nextRegionW / S.boardR) * width}
			<div
				class={region}
				style="--w: {outerW}px; --b: {(outerW - innerW) / 2}px"
			></div>
		{/each}

		<div class="twenty" style="--w: {(S.twentyR / S.boardR) * width}px;"></div>

		{#each regions as region}
			{@const text = regionText[region]}
			{@const y = (width - (S[`${region}R`] / S.boardR) * width) / 2}
			{@const extra = region === "twenty" ? (S.twentyR / S.boardR) * width : 0}
			<span class="text text-{region}" style="--y: {y + extra}px;">{text}</span>
		{/each}

		{#each angles as angle}
			<div
				class="quadrant-line"
				style="--w: {(((S.fiveR - S.tenR) / S.boardR) * width) /
					2}px; --x: {((S.tenR / S.boardR) * width) /
					2}px; --angle: {angle}deg;"
			></div>
		{/each}

		{#each pegs as peg}
			<div
				class="peg"
				style="--w: {(S.pegR / S.boardR) * width}px; --x: {(((S.fifteenR -
					S.pegR) /
					S.boardR) *
					width) /
					2}px; --angle: {peg - 1}deg;"
			></div>
		{/each}
	</div>
	<div class="fg" bind:this={element}></div>

	<div class="message">
		{#if reactText}
			<p transition:fade class="text-outline">
				<strong>{reactText}</strong>
			</p>
		{/if}
	</div>
</div>

<div class="ui" class:visible={uiVisible || !tutorial}>
	<div class="top">
		{#if !replay}
			{#if phase === "shoot"}
				<Button {disabled} bind:value={power} on:release={onRelease}></Button>
			{:else}
				<button on:click={onPhaseClick}>Place Disc</button>
			{/if}
		{/if}
	</div>

	<div class="bottom">
		{#if !replay}
			{#if phase === "position"}
				<Slider
					label="position"
					min={rangeDefault.position.min}
					max={rangeDefault.position.max}
					step={rangeDefault.position.step}
					{disabled}
					bind:value={rangeValuePosition}
				></Slider>
			{:else if phase === "shoot"}
				<Slider
					label="aim"
					min={rangeDefault.shoot.min}
					max={rangeDefault.shoot.max}
					step={rangeDefault.shoot.step}
					{disabled}
					bind:value={rangeValueShoot}
				></Slider>
			{/if}
		{/if}
	</div>
</div>

{#if dev}
	<p>sliderPosition: {rangeValuePosition[0]}</p>
	<p>sliderShoot: {rangeValueShoot[0]}</p>
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
		font-family: var(--sans);
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
			translate(calc(var(--x) - 0px), calc(var(--w) - 0px));
		width: var(--w);
		border: none;
		background: var(--color-peg);
	}

	p {
		margin: 0;
		font-size: var(--14px);
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
		text-align: center;
		font-size: var(--14px);
	}

	:global(.ui button) {
		padding: 0;
		width: 10em;
		text-transform: uppercase;
		height: 100%;
	}

	span.text {
		transition: opacity 0.2s;
		position: absolute;
		top: var(--y);
		left: 50%;
		transform: translate(-50%, 8px);
		color: var(--color-fg-light);
		font-weight: bold;
		font-size: var(--14px);
	}

	.tutorial span.text {
		opacity: 1;
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

	/* .tutorial span.text-twenty {
		transform: translate(-50%, calc(var(--d) + 4px));
	} */

	.tutorial-regions span {
		color: var(--color-fg-dark);
	}

	.tutorial-regions span.text-fifteen,
	.tutorial-regions span.text-twenty,
	.tutorial-fifteen span.text-fifteen,
	.tutorial-fifteen span.text-twenty {
		color: var(--color-bg);
	}

	.score {
		display: flex;
		justify-content: space-between;
		font-family: var(--sans);
		font-size: var(--14px);
		pointer-events: none;
		margin: 0 auto 8px auto;
	}

	.score p {
		margin: 0;
	}

	.holder {
		visibility: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.holder.visible {
		visibility: visible;
	}

	.holder.you {
		color: var(--color-you-text);
		text-align: left;
	}

	.holder.opp {
		color: var(--color-opp-text);
		text-align: right;
	}

	.points {
		color: var(--color-fg-light);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.score .label {
		font-size: var(--12px);
	}

	.score p.animate {
		animation: zoom 0.5s ease-in-out;
	}

	.points {
		visibility: hidden;
		text-align: center;
	}

	.points.visible {
		visibility: visible;
	}

	.end {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.message p {
		margin: 0;
		line-height: 1;
		width: 100%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: var(--20px);
		text-align: center;
		text-transform: uppercase;
	}

	@media only screen and (max-width: 600px) {
		.message p {
			font-size: var(--16px);
		}
	}

	@keyframes zoom {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.5);
		}
		100% {
			transform: scale(1);
		}
	}
</style>

<script>
	import { tick, onMount } from "svelte";
	import { fade } from "svelte/transition";
	// import { range } from "d3";
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

	const holder = { player1: 0, player2: 0 };
	const score = { player1: 0, player2: 0, leader: "" };
	const animate = { player1: false, player2: false };

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
		reactTimeout = setTimeout(() => {
			reactText = null;
			updateTutorial();
		}, 2000);
	}

	function endRound() {
		phase = "end";
		reactText = `${score.player1 > score.player2 ? "You" : "Opp."} win the round`;
	}

	function updateScore({ discs, valid }) {
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
		updateScore({ discs, valid });
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

	function updateRange() {
		if (!sliderAnimated) {
			sliderAnimated = rangeValue[0] !== rangeDefault.position.value[0];
			animateSlider = !sliderAnimated;
		}
		if (phase === "position") crokinole.positionDisc(rangeValue[0] * width);
		else if (phase === "shoot") {
			const visible = tutorial ? tutorial.includes("try") : true;
			degrees = Math.round(rangeValue[0]);
			crokinole.aimDisc({
				degrees,
				power: 0.25,
				visible
			});
		}
	}

	function updatePower() {
		const visible = tutorial ? tutorial.includes("try") : true;
		crokinole.aimDisc({ degrees, power, visible });
	}

	function onPhaseClick() {
		if (phase === "position") {
			phase = "shoot";
			rangeValue = rangeDefault.shoot.value;
			power = powerDefault;
			crokinole.setState("shoot");
		}
	}

	function resetScore() {
		holder.player1 = 0;
		holder.player2 = 0;
		score.player1 = 0;
		score.player2 = 0;
	}

	// function onReplay() {
	// crokinole.removeDiscs();
	// updateTutorial(tutorial, 2000);
	// }

	async function updateTutorial() {
		disabled = false;
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
		// console.log({ tutorial, sliderAnimated, animateSlider });
		power = powerDefault;
		const s = scenarios[tutorial];

		crokinole.removeDiscs();
		if (s) s.forEach(crokinole.addDisc);

		if ((replay || end) && s) {
			const shooter = s[s.length - 1];
			const rd = shooter.random ? Math.random() * 3 - 1.5 : 0;
			const d = shooter.degrees + rd;
			const rp = shooter.random ? Math.random() * 0.07 - 0.035 : 0;
			const p = shooter.power + rp;

			if (end) {
				pointsVisible = true;
				updateScore({ discs: s, valid: true });
			}

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

	$: x = target ? (target.x / width).toFixed(2) : 0;
	$: y = target ? (target.y / width).toFixed(2) : 0;
	$: if (width) crokinole.init({ element, width, tutorial });
	$: if (width) updateRange(rangeValue);
	$: if (width) updatePower(power);
	$: if (width && tutorial) updateTutorial(tutorial);
	$: tutorialClass = tutorial ? `tutorial tutorial-${tutorial}` : "";

	onMount(() => {
		crokinole.on("shotComplete", onShotComplete);
		crokinole.on("shotCompleteManual", onShotCompleteManual);
	});
</script>

<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="score" style:width="{width}px">
	<!-- <p>Player 1: {score.player1}</p> -->
	<!-- <p>Player 2: {score.player2}</p> -->
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
				class="text text-{region}"
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
		<!-- {#if replay}
			<button disabled={replayDisabled} on:click={onReplay}>Replay</button> -->
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
			<Slider
				label={phase === "shoot" ? "aim" : phase}
				min={rangeDefault[phase]?.min}
				max={rangeDefault[phase]?.max}
				step={rangeDefault[phase]?.step}
				animate={animateSlider}
				{disabled}
				bind:value={rangeValue}
			></Slider>
		{/if}
		<!-- <p><em>Press for power and release to shoot</em></p> -->
	</div>
</div>

{#if dev}
	<p>slider: {rangeValue[0]}</p>
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

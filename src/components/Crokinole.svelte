<script>
	import { tick, onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { format } from "d3";

	import C from "$utils/crokinole.js";
	import * as S from "$data/specs.js";

	import Bg from "$components/Crokinole.Bg.svelte";
	import Score from "$components/Crokinole.Score.svelte";
	import Ui from "$components/Crokinole.Ui.svelte";
	import Game from "$components/Crokinole.Game.svelte";
	import scenarios from "$data/scenarios.json";

	export let width;
	export let tutorial;
	export let autoMute;
	export let game;
	export let mode;

	const crokinole = C();

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
	const score = { player1: 0, player2: 0 };
	const animate = { player1: false, player2: false };
	const shots = { player1: 8, player2: 8 };

	let element = undefined;
	let ready = false;
	let turn = 0;
	let rangeValuePosition = rangeDefault.position.value;
	let rangeValueShoot = rangeDefault.shoot.value;
	let power = powerDefault;
	let phase = "position";
	let degrees = 0;
	let reactText = "";
	let disabled = false;
	let replay = false;
	let autoplayTimeout = undefined;
	let replayTimeout = undefined;
	let reactTimeout = undefined;
	let animateSlider = false;
	let sliderAnimated = false;
	let pointsVisible = true;
	let holderVisible = true;

	function onSliderChange({ detail }) {
		if (sliderAnimated) return;
		if (detail[0] !== rangeDefault.position.value) {
			sliderAnimated = true;
			animateSlider = !sliderAnimated;
		}
	}

	async function onShotComplete({ discs, valid }) {
		power = powerDefault;
		resetRanges();
		disabled = false;
		resetScore(true);
		updateScore(discs);
		turn += 1;
		// reduce the number of shots left for player 1 or player 2
		const sub = turn % 2 === 0 ? "player2" : "player1";
		const player = turn % 2 === 0 ? "player1" : "player2";
		shots[sub] -= 1;
		if (turn === 16) endRound();
		else {
			await tick();
			disabled = player === "player2";
			phase = "position";
			const bot = game && player === "player2";
			crokinole.addDisc({ player, mode: "position", bot });
		}
	}

	function react({ discs, valid }) {
		if (valid) {
			// scored 20
			const scored20 = discs.some((disc) => disc.score === 20);
			const allOpp0 = discs
				.filter((d) => d.player === "player2")
				.every((disc) => disc.score === 0);
			const goal20 = tutorial.includes("open");
			const goalRicochet = tutorial.includes("ricochet");
			const custom =
				goal20 || goalRicochet
					? scored20
						? "Nice 20!"
						: "But not a 20 :("
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
		const you = score.player1 > score.player2;
		const tie = score.player1 === score.player2;
		reactText = tie
			? "You tied the round"
			: `${score.player1 > score.player2 ? "You" : "Bot"} win${you ? "" : "s"} the round`;
	}

	function updateScore(discs) {
		// add discs to score
		discs.forEach((disc) => {
			if (disc.valid && disc.score && disc.score !== 20)
				score[disc.player] += disc.score;
			if (disc.valid && disc.score === 20) {
				animate[disc.player] = true;
				holder[disc.player]++;
			}
		});

		// add 20s
		score.player1 += holder.player1 * 20;
		score.player2 += holder.player2 * 20;
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
		crokinole.aimDisc({ degrees, power, visible, random: game });
	}

	async function onPhaseClick() {
		if (phase === "position") {
			phase = "shoot";
			power = powerDefault;
			resetRanges();
			crokinole.setState("shoot");
		} else if (phase === "end") {
			resetGame();
		}
	}

	function resetScore(keep) {
		holder.player1 = keep ? holder.player1 : 0;
		holder.player2 = keep ? holder.player2 : 0;
		score.player1 = 0;
		score.player2 = 0;
		shots.player1 = keep ? shots.player1 : 8;
		shots.player2 = keep ? shots.player2 : 8;
	}

	async function updateTutorial() {
		if (!tutorial) return;
		resetScore();
		clearTimeout(autoplayTimeout);
		clearTimeout(replayTimeout);
		clearTimeout(reactTimeout);
		reactText = null;
		replay = !tutorial.includes("try");
		const end = tutorial === "score";
		pointsVisible = !["regions", "ricochettry"].includes(tutorial);
		holderVisible = pointsVisible;
		animateSlider = tutorial === "opponenttry" && !sliderAnimated;
		power = powerDefault;
		const s = scenarios[tutorial];

		crokinole.removeDiscs();
		if (s) {
			s.forEach(crokinole.addDisc);
			s.forEach((s) => (s.valid = true));
			updateScore(s);
		}

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

	function resetGame() {
		phase = "position";
		crokinole.removeDiscs();
		crokinole.addDisc();
		turn = 0;
		resetScore();
	}

	$: tutorialClass = tutorial ? `tutorial tutorial-${tutorial}` : "";
	$: if (ready) crokinole.resize(width);
	$: if (ready) updateRangePosition(rangeValuePosition, width);
	$: if (ready) updateRangeShoot(rangeValueShoot, width);
	$: if (ready) updatePower(power, width);
	$: if (ready) updateTutorial(tutorial);
	$: crokinole.autoMute(autoMute);
	$: crokinole.setDifficulty(mode);

	onMount(async () => {
		crokinole.on("shotComplete", onShotComplete);
		crokinole.on("shotCompleteManual", onShotCompleteManual);
		crokinole.on("ready", () => (ready = true));
		crokinole.init({ element, width, tutorial });
		if (game) resetGame();
	});
</script>

{#if game}
	<Game {width} {shots}></Game>
{/if}

<Score {pointsVisible} {holderVisible} {animate} {holder} {score} {width}
></Score>

<div class="c">
	<Bg {tutorialClass} {width}></Bg>
	<div
		class="fg"
		bind:this={element}
		style:width="{width}px"
		style:height="{width}px"
	></div>

	<div class="message">
		{#if reactText}
			<p transition:fade class="text-outline">
				<strong>{reactText}</strong>
			</p>
		{/if}
	</div>
</div>

<Ui
	visible={!replay || !tutorial || (phase === "end" && game)}
	{width}
	{phase}
	{disabled}
	{rangeDefault}
	animate={animateSlider}
	bind:rangeValuePosition
	bind:rangeValueShoot
	bind:power
	on:release={onRelease}
	on:click={onPhaseClick}
	on:change={onSliderChange}
></Ui>

<style>
	.c {
		position: relative;
		display: flex;
		width: 100%;
		margin: 0 auto;
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

	p {
		margin: 0;
		font-size: var(--14px);
		text-align: center;
	}

	.fg {
		position: relative;
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
</style>

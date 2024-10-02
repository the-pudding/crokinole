<script>
	import * as S from "$data/specs.js";

	export let width;
	export let tutorialClass;

	const angles = [45, 135, 225, 315];
	const pegs = [15, 60, 105, 150, 195, 240, 285, 330];
	const regions = ["five", "ten", "fifteen", "twenty"];
	const regionText = {
		five: "5",
		ten: "10",
		fifteen: "15",
		twenty: "20"
	};
</script>

<div
	class="bg {tutorialClass}"
	style:width="{width}px"
	style:height="{width}px"
>
	<div
		class="base"
		style="--w: {((S.baseR - S.rimW) / S.boardR) * width}px; --b: {(S.rimW /
			S.boardR) *
			width}px;"
	></div>

	<div class="surface" style="--w: {(S.surfaceR / S.boardR) * width}px;"></div>

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
				2}px; --x: {((S.tenR / S.boardR) * width) / 2}px; --angle: {angle}deg;"
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

<style>
	.bg {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		pointer-events: none;
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
</style>

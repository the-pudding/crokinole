<script>
	import Crokinole from "$components/Crokinole.svelte";
	import viewport from "$stores/viewport.js";
	import inView from "$actions/inView.js";
	import * as S from "$data/specs.js";
	export let steps;

	let step = 0;
	let offsetWidth;
	let heights = [];
	let notInView = true;
	let animate = true;

	function onStep(n) {
		// scroll .rules into view
		animate = false;
		const rules = document.querySelector(".rules");
		rules.scrollIntoView({ behavior: "smooth" });
		step += n;
	}
	$: longestIndex = steps.reduce(
		(acc, cur, i) => (cur.length > steps[acc].length ? i : acc),
		0
	);
	$: stepHeight = heights.length ? heights[longestIndex] : 0;
	$: tutorial = steps[step].id;
	$: totalHeight =
		stepHeight + S.uiHeight + S.scoreHeight + S.marginBottom + S.stepperPadding;
	$: maxHeight = $viewport.height - totalHeight;
	$: width = Math.min(offsetWidth, maxHeight);
</script>

<div class="c rules">
	<div class="stepper">
		<button class="prev" disabled={step === 0} on:click={() => onStep(-1)}
			>PREV</button
		>
		<div class="steps" style:height="{stepHeight}px">
			{#each steps as { id, text }, i}
				{@const visible = i === step}
				<p class:visible bind:offsetHeight={heights[i]}>{@html text}</p>
			{/each}
		</div>
		<button
			class="next"
			class:animate
			disabled={step === steps.length - 1}
			on:click={() => onStep(1)}>NEXT</button
		>
	</div>

	<figure
		bind:offsetWidth
		use:inView
		on:enter={() => (notInView = false)}
		on:exit={() => (notInView = true)}
	>
		{#if offsetWidth}
			<Crokinole {width} {tutorial} autoMute={notInView}></Crokinole>
			<p class="continue" class:visible={step === steps.length - 1}>
				&darr; Keep scrolling &darr;
			</p>
		{/if}
	</figure>
</div>

<style>
	.c {
		margin-bottom: 128px;
	}

	figure {
		margin: 0 auto 32px;
		width: 100%;
		position: relative;
		min-height: 280px;
	}

	.continue {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		text-align: center;
		text-transform: uppercase;
		color: var(--color-fg-light);
		margin: 0;
		font-family: var(--sans);
		font-size: var(--16px);
		font-weight: bold;
		visibility: hidden;
	}

	.continue.visible {
		visibility: visible;
	}

	.stepper {
		display: flex;
		padding-top: 16px;
		padding-bottom: 16px;
	}

	button {
		flex: 0;
		align-self: center;
	}

	button.next.animate {
		animation: pulse 1s ease-in-out infinite;
	}

	.steps {
		position: relative;
		flex: 1;
		padding: 0 16px;
	}

	.steps p {
		margin: 0;
		position: absolute;
		top: 50%;
		left: 16px;
		width: calc(100% - 32px);
		transform: translateY(-50%);
		visibility: hidden;
		color: var(--color-black);
		padding: 16px;
		font-family: var(--serif);
		background: var(--color-bg-dark);
		box-shadow: 6px 6px 0 0px var(--color-gray-300);
		font-size: var(--20px);
	}

	p.visible {
		visibility: visible;
	}

	:global(span.opp) {
		color: var(--color-opp-text);
		font-weight: bold;
	}

	:global(span.you) {
		color: var(--color-you-text);
		font-weight: bold;
	}

	:global(span.fifteen) {
		color: var(--color-purple-aaa);
		font-weight: bold;
	}

	@media only screen and (max-width: 800px) {
		.steps p {
			font-size: var(--16px);
		}

		/* put the buttons above .steps */
		.stepper {
			flex-wrap: wrap;
			justify-content: space-between;
			padding-top: 16px;
		}

		.prev {
			order: 1;
			margin-bottom: 16px;
		}

		.next {
			order: 2;
			margin-bottom: 16px;
		}

		.steps {
			order: 3;
			min-width: 100%;
			padding: 0;
		}

		.steps p {
			width: 100%;
			left: 0;
		}
	}

	@keyframes zoom {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.25);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 transparent;
		}
		50% {
			box-shadow: 0 0 4px 4px var(--color-mark);
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}
</style>

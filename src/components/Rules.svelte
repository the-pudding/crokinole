<script>
	import Crokinole from "$components/Crokinole.svelte";
	export let steps;

	let el;
	let step = 0;
	let offsetWidth;
	let heights = [];
	let tutorial;

	function onStep(n) {
		step += n;
	}

	function updateTutorial() {
		if (step === 0) tutorial = "regions";
		else if (step === 1) tutorial = "open";
	}

	$: width = el?.offsetWidth;
	$: text = steps[step];
	$: num = step + 1;
	$: longestIndex = steps.reduce(
		(acc, cur, i) => (cur.length > steps[acc].length ? i : acc),
		0
	);
	$: height = heights.length ? `${heights[longestIndex]}px` : 0;
	$: updateTutorial(step);
</script>

<div class="c">
	<div class="stepper">
		<button disabled={step === 0} on:click={() => onStep(-1)}>PREV</button>
		<div class="steps" style:height>
			{#each steps as text, i}
				{@const visible = step === i}
				<p class:visible bind:offsetHeight={heights[i]}>{@html text}</p>
			{/each}
		</div>
		<button disabled={step === steps.length - 1} on:click={() => onStep(1)}
			>NEXT</button
		>
	</div>

	<figure bind:this={el} bind:offsetWidth>
		<Crokinole {width} ui={true} {tutorial}></Crokinole>
	</figure>
</div>

<style>
	figure {
		--width: calc(min(100svw, 100svh) * 0.7);
		width: var(--width);
		margin: 32px auto;
	}

	.stepper {
		display: flex;
	}

	button {
		flex: 0;
		align-self: center;
	}

	.steps {
		position: relative;
		flex: 1;
		padding: 0 16px;
	}

	p {
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
		/* border-top: 4px solid var(--color-fg); */
		/* background: var(--color-mark); */
		/* box-shadow: 4px 4px 0 2px var(--color-pink-aa); */
		background: var(--color-bg2);
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
</style>

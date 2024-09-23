<script>
	import Crokinole from "$components/Crokinole.svelte";
	export let steps;

	let el;
	let step = 0;
	let offsetWidth;
	let heights = [];

	$: width = el?.offsetWidth;
	$: text = steps[step];
	$: num = step + 1;
	$: longestIndex = steps.reduce(
		(acc, cur, i) => (cur.length > steps[acc].length ? i : acc),
		0
	);
	$: height = heights.length ? `${heights[longestIndex]}px` : 0;
</script>

<div class="c">
	<div class="steps" style:height>
		{#each steps as text, i}
			{@const visible = step === i}
			<p class:visible bind:offsetHeight={heights[i]}>{text}</p>
		{/each}
	</div>

	<figure bind:this={el} bind:offsetWidth>
		<Crokinole {width}></Crokinole>
	</figure>
</div>

<style>
	figure {
		--width: calc(min(100svw, 100svh) * 0.7);
		width: var(--width);
		margin: 32px auto;
	}

	.steps {
		position: relative;
	}

	p {
		margin: 0;
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		transform: translateY(-50%);
		visibility: hidden;
		background: var(--color-mark);
		color: var(--color-black);
		padding: 16px;
		font-family: var(--serif);
		border: 4px solid var(--color-fg);
	}

	p.visible {
		visibility: visible;
	}
</style>

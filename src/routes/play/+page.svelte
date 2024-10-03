<script>
	import { browser } from "$app/environment";
	import Crokinole from "$components/Crokinole.svelte";
	import viewport from "$stores/viewport.js";
	import * as S from "$data/specs.js";
	import Mute from "$components/Mute.svelte";
	import Header from "$components/Header.svelte";

	let el;
	let offsetWidth;
	let mode = "easy";
	let ready;

	function onClick(m) {
		mode = m;
		ready = true;
	}

	$: totalHeight = S.uiHeight + S.scoreHeight * 2 + S.marginBottom * 3;
	$: maxHeight = $viewport.height - totalHeight;
	$: width = offsetWidth ? Math.min(offsetWidth - S.marginSide, maxHeight) : 0;
</script>

<div class="intro" class:hide={ready}>
	<section>
		<Header></Header>
		<h1>Crokinole Simulator 3000</h1>
		<p>Can you win a round against Crokinole Bot?</p>
		<p>Not sure what Crokinole is? <a href="../">Read our story</a>.</p>
		<div class="mode">
			<p>Select Difficulty</p>
			<div class="choices">
				<button on:click={() => onClick("easy")}>Easy</button>
				<button on:click={() => onClick("hard")}>Hard</button>
			</div>
		</div>
	</section>
</div>

<Header top={true}></Header>

<figure bind:this={el} bind:offsetWidth width="{width}px" height="{width}px">
	{#if offsetWidth}
		<Crokinole {width} game={true} {mode}></Crokinole>
	{/if}
</figure>

<Mute></Mute>

<style>
	h1 {
		text-align: center;
		font-size: clamp(28px, 5vw, 128px);
		font-family: var(--serif-hed);
	}

	figure {
		margin: 32px auto;
		position: relative;
	}

	p {
		text-align: center;
		margin: 0 auto;
	}

	section p:nth-of-type(2) {
		font-size: var(--16px);
	}

	.intro {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100svh;
		z-index: var(--z-overlay);
		background: rgba(255, 255, 255, 0.9);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.intro.hide {
		display: none;
	}

	.mode {
		background: var(--color-bg-dark);
		padding: 32px;
		max-width: 20em;
		width: 80%;
	}

	.mode p {
		font-family: var(--sans);
		font-size: var(--16px);
		font-weight: bold;
		text-transform: uppercase;
		margin-bottom: 8px;
	}

	.choices {
		display: flex;
		justify-content: center;
	}

	button {
		margin: 0 8px;
		text-transform: uppercase;
	}
</style>

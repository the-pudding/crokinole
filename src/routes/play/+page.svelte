<script>
	import { browser } from "$app/environment";
	import Crokinole from "$components/Crokinole.svelte";
	import viewport from "$stores/viewport.js";
	import * as S from "$data/specs.js";
	import copy from "$data/copy.json";
	import Mute from "$components/Mute.svelte";
	import Header from "$components/Header.svelte";
	import Meta from "$components/Meta.svelte";
	import Ul from "$components/Ul.svelte";

	let el;
	let offsetWidth;
	let mode = "easy";
	let ready;
	let rulesVisible = false;

	const preloadFont = [
		"https://pudding.cool/assets/fonts/tiempos/TiemposTextWeb-Regular.woff2",
		"https://pudding.cool/assets/fonts/tiempos/TiemposTextWeb-Bold.woff2",
		"https://pudding.cool/assets/fonts/atlas/AtlasGrotesk-Regular-Web.woff2",
		"https://pudding.cool/assets/fonts/atlas/AtlasGrotesk-Bold-Web.woff2"
	];

	const title = "Crokinole Simulator 3000";
	const description = "Can you win a round against Crokinole Bot?";
	const url = "https://pudding.cool/2024/10/crokinole/play";
	const keywords =
		"crokinole, crokinole simulator, crokinole bot, crokinole game";

	function onClick(m) {
		mode = m;
		ready = true;
	}

	$: totalHeight = S.uiHeight + S.scoreHeight * 2 + S.marginBottom * 3;
	$: maxHeight = $viewport.height - totalHeight;
	$: width = offsetWidth ? Math.min(offsetWidth - S.marginSide, maxHeight) : 0;
</script>

<Meta {title} {description} {url} {preloadFont} {keywords} img={"og-play"} />

<div class="intro" class:hide={ready}>
	<section>
		<Header intro={true}></Header>
		<h1>Crokinole Simulator 3000</h1>
		<p>
			Can <strong class="color-text-you">you</strong> win a round against
			<strong class="color-text-opp">Crokinole Bot?</strong>
		</p>
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

<div class="c">
	<figure bind:this={el} bind:offsetWidth width="{width}px" height="{width}px">
		{#if offsetWidth}
			<Crokinole {width} game={true} {mode}></Crokinole>
		{/if}
	</figure>
</div>

<button class="show-rules" on:click={() => (rulesVisible = true)}>
	Rules</button
>

<div class="rules" class:visible={rulesVisible}>
	<div class="bg"></div>
	<div class="inner">
		{#each copy.Rules.text as { type, value }}
			{#if type === "Ul"}
				<Ul list={value.list}></Ul>
			{:else}
				<p>{@html value}</p>
			{/if}
		{/each}
		<div class="close">
			<button on:click={() => (rulesVisible = false)}>Close</button>
		</div>
	</div>
</div>

<Mute></Mute>

<style>
	h1 {
		text-align: center;
		font-size: clamp(28px, 5vw, 128px);
		font-family: var(--serif-hed);
	}

	.c {
		padding: 0 16px;
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
		width: 8em;
	}

	.rules {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100svh;
		z-index: var(--z-overlay);
		overflow: auto;
		visibility: hidden;
	}

	.rules.visible {
		visibility: visible;
	}

	.rules .bg {
		background: var(--color-bg);
		opacity: 0.95;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	.rules .inner {
		color: var(--color-fg);
		position: relative;
		width: 90%;
		padding: 16px;
		max-width: 700px;
		margin: 32px auto 0 auto;
		font-family: var(--sans);
	}

	.rules .inner p {
		text-align: left;
	}

	.rules p {
		font-size: var(--16px);
	}

	:global(.rules ul) {
		padding-left: 16px;
		margin-bottom: 16px;
	}

	:global(.rules ul li) {
		font-size: var(--16px);
		margin: 8px 0;
	}

	button.show-rules {
		width: auto;
		position: fixed;
		top: 16px;
		right: 16px;
		margin: 0;
	}

	.rules .close {
		margin-top: 16px;
		text-align: center;
	}

	@media only screen and (max-width: 800px) {
		.c {
			padding-top: 40px;
		}
	}
</style>

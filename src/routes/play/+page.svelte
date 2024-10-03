<script>
	import { browser } from "$app/environment";
	import Crokinole from "$components/Crokinole.svelte";
	import viewport from "$stores/viewport.js";
	import * as S from "$data/specs.js";
	import Mute from "$components/Mute.svelte";

	let el;
	let offsetWidth;

	$: totalHeight = S.uiHeight + S.scoreHeight * 2 + S.marginBottom * 3;
	$: maxHeight = $viewport.height - totalHeight;
	$: width = offsetWidth ? Math.min(offsetWidth - S.marginSide, maxHeight) : 0;
</script>

<section class="intro">
	<p><strong>Can you win a round against Crokinole Bot?</strong></p>
	<p>Not sure what Crokinole is? <a href="../">Read our story</a>.</p>
</section>
<figure bind:this={el} bind:offsetWidth width="{width}px" height="{width}px">
	{#if offsetWidth}
		<Crokinole {width} game={true}></Crokinole>
	{/if}
</figure>

<Mute></Mute>

<style>
	figure {
		margin: 32px auto;
		position: relative;
	}

	p {
		text-align: center;
		margin: 0 auto;
	}

	.intro p:last-of-type {
		font-size: var(--16px);
	}
</style>

<script>
	export let src;
	export let poster;
	export let preload = "auto";
	export let autoplay = false;
	export let loop = false;
	export let muted = false;
	export let controls = false;
	export let restart = false;
	export let figcaption;
	import RotateCCW from "lucide-svelte/icons/rotate-ccw";

	let videoEl;
	function onRestart() {
		if (!videoEl) return;
		videoEl.currentTime = 0;
		video.play();
	}
</script>

<figure>
	<video
		bind:this={videoEl}
		{src}
		{poster}
		{preload}
		{autoplay}
		{loop}
		{muted}
		{controls}
	></video>
	{#if restart}<button on:click={onRestart} aria-label="restart"
			><RotateCCW></RotateCCW></button
		>{/if}
	{#if figcaption}
		<figcaption>
			{@html figcaption}
		</figcaption>
	{/if}
</figure>

<style>
	figure {
		position: relative;
		margin: 32px 0;
	}

	figcaption {
		font-size: var(--14px);
		padding: 8px 0;
		text-align: center;
	}

	video {
		display: block;
		margin: 0;
	}

	button {
		position: absolute;
		top: 16px;
		right: 16px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>

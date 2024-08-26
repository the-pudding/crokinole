<script>
	export let src;
	export let poster;
	export let preload = "auto";
	export let autoplay = false;
	export let loop = false;
	export let muted = false;
	export let controls = false;
	export let restart = false;
	import RotateCCW from "lucide-svelte/icons/rotate-ccw";

	let videoEl;
	function onRestart() {
		if (!videoEl) return;
		videoEl.currentTime = 0;
		video.play();
	}
</script>

<div class="video-container">
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
</div>

<style>
	.video-container {
		position: relative;
	}

	video {
		display: block;
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

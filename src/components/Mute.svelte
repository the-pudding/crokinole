<script>
	import { getContext, onMount } from "svelte";
	import { muted } from "$stores/misc.js";
	import Volume2 from "lucide-svelte/icons/volume-2";
	import VolumeX from "lucide-svelte/icons/volume-x";

	onMount(() => {
		document.addEventListener("visibilitychange", () => {
			const hidden = document.hidden;
			if (hidden) globalMute = $muted;
			$muted = globalMute || hidden;
		});
	});
</script>

<button on:click={() => ($muted = !$muted)} aria-label="Toggle Mute">
	{#if $muted}
		<VolumeX></VolumeX>
	{:else}
		<Volume2></Volume2>
	{/if}
</button>

<style>
	button {
		position: fixed;
		bottom: 8px;
		right: 8px;
		z-index: var(--z-top);
		border: none;
		background: var(--color-bg);
		padding: 4px;
	}
	button:hover {
		background: var(--color-bg);
	}
</style>

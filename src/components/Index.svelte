<script>
	import { browser } from "$app/environment";
	import { format } from "d3";
	import { getContext, onMount } from "svelte";
	import MicroCMS from "$components/helpers/MicroCMS.svelte";
	import Hero from "$components/Hero.svelte";
	import Byline from "$components/Byline.svelte";
	import Video from "$components/Video.svelte";
	import Image from "$components/Image.svelte";
	import Table from "$components/Table.svelte";
	import Method from "$components/Method.svelte";
	import Histogram from "$components/Histogram.svelte";
	import Rules from "$components/Rules.svelte";
	import Play from "$components/Play.svelte";
	import { muted } from "$stores/misc.js";
	import Volume2 from "lucide-svelte/icons/volume-2";
	import VolumeX from "lucide-svelte/icons/volume-x";

	const components = {
		Hero,
		Byline,
		Video,
		Image,
		Table,
		Method,
		Histogram,
		Rules,
		Play
	};

	const copy = getContext("copy");
	$: body = copy.body;
</script>

<button on:click={() => ($muted = !$muted)}>
	{#if $muted}
		<VolumeX></VolumeX>
	{:else}
		<Volume2></Volume2>
	{/if}
</button>
<MicroCMS {body} {components}></MicroCMS>

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

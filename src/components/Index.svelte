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

	const components = {
		Hero,
		Byline,
		Video,
		Image,
		Table,
		Method,
		Histogram,
		Rules
	};

	const copy = getContext("copy");
	$: body = copy.body;
</script>

<MicroCMS {body} {components}></MicroCMS>
<!-- 
{#if browser}
	<Crokinole />
{/if} -->

<script>
	import { browser } from "$app/environment";
	import { format } from "d3";
	import { getContext, onMount } from "svelte";
	import Crokinole from "$components/Crokinole.svelte";
	import Hero from "$components/Hero.svelte";
	import Byline from "$components/Byline.svelte";
	import Video from "$components/Video.svelte";
	import Image from "$components/Image.svelte";
	import Table from "$components/Table.svelte";
	import Method from "$components/Method.svelte";
	import MicroCMS from "$components/helpers/MicroCMS.svelte";

	const components = { Hero, Byline, Video, Image, Table, Method };

	const copy = getContext("copy");
	$: body = copy.body;

	onMount(() => {
		// TODO replace Aug 1 with real publish date
		const elapsed = Math.floor(
			(new Date() - new Date(2024, 7, 1)) / 1000 / 60 / 60 / 24
		);
		document.querySelector(".elapsed").textContent =
			`about ${format(",")(elapsed)} days after I wrote it`;
	});
</script>

<MicroCMS {body} {components}></MicroCMS>
<!-- 
{#if browser}
	<Crokinole />
{/if} -->

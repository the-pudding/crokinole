<script>
	import { browser } from "$app/environment";
	import { format } from "d3";
	import { getContext, onMount } from "svelte";
	import Crokinole from "$components/Crokinole.svelte";
	import Hero from "$components/Hero.svelte";
	import Byline from "$components/Byline.svelte";
	import CMS from "$components/helpers/CMS.svelte";

	const components = { Hero, Byline };

	const copy = getContext("copy");
	$: body = copy.body;

	onMount(() => {
		// Aug 1, 2024 to now (in days)
		const elapsed = Math.floor(
			(new Date() - new Date(2024, 7, 1)) / 1000 / 60 / 60 / 24
		);
		document.querySelector(".elapsed").textContent =
			`about ${format(",")(elapsed)} days since I wrote it`;
	});
</script>

<CMS {body} {components}></CMS>
<!-- 
{#if browser}
	<Crokinole />
{/if} -->

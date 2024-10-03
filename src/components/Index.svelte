<script>
	import { browser } from "$app/environment";
	import { format } from "d3";
	import { getContext } from "svelte";
	import MicroCMS from "$components/helpers/MicroCMS.svelte";
	import Hero from "$components/Hero.svelte";
	import Byline from "$components/Byline.svelte";
	import Video from "$components/Video.svelte";
	import Image from "$components/Image.svelte";
	import Table from "$components/Table.svelte";
	import Method from "$components/Method.svelte";
	import Histogram from "$components/Histogram.svelte";
	import Rules from "$components/Rules.svelte";
	import Ul from "$components/Ul.svelte";
	import Situation from "$components/Situation.svelte";
	import Footer from "$components/Footer.svelte";
	import Mute from "$components/Mute.svelte";

	const components = {
		Hero,
		Byline,
		Video,
		Image,
		Table,
		Method,
		Histogram,
		Rules,
		Ul,
		Situation
	};

	const copy = getContext("copy");
	let globalMute;
	$: body = copy.body;
</script>

<Mute></Mute>
<MicroCMS {body} {components}></MicroCMS>

<Footer></Footer>

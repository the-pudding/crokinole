<script>
	import { Canvas } from "@threlte/core";
	import { World } from "@threlte/rapier";

	import Scene from "$components/Scene.svelte";
</script>

<div>
	<Canvas>
		<World>
			<Scene />
		</World>
	</Canvas>
</div>

<style>
	div {
		max-width: 640px;
		margin: 0 auto;
		aspect-ratio: 1;
		background: black;
	}
</style>

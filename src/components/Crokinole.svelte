<script>
	import { Canvas } from "@threlte/core";
	import Scene from "./Scene.svelte";
	import UI from "./UI.svelte";
</script>

<Canvas>
	<Scene />
</Canvas>

<UI />

<style>
	:global(canvas) {
		width: 100%;
		height: 80vh;
	}
</style>

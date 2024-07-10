<script>
	import { onMount } from "svelte";
	import { Canvas, useStage, useTask, useThrelte } from "@threlte/core";
	import { HTML } from "@threlte/extras";
	import { Debug, World, useRapier } from "@threlte/rapier";
	import Scene from "./Scene.svelte";
	import { ThreePerf } from "three-perf";

	let scene;
	onMount(() => {
		// useRapier();
		// const { world } = useRapier();
		// console.log(world);
		// world.gravity = { x: 0, y: 9.81, z: 0 };
		// const { renderer, mainStage, renderStage } = useThrelte();
		// const perf = new ThreePerf({
		// 	anchorX: "left",
		// 	anchorY: "top",
		// 	domElement: document.body,
		// 	renderer
		// });
		// const beforeMainStage = useStage("three-perf-begin", {
		// 	before: mainStage
		// });
		// useTask(
		// 	() => {
		// 		perf.begin();
		// 	},
		// 	{ stage: beforeMainStage }
		// );
		// const afterRenderStage = useStage("three-perf-end", {
		// 	after: renderStage
		// });
		// useTask(
		// 	() => {
		// 		perf.end();
		// 	},
		// 	{ stage: afterRenderStage }
		// );
	});
</script>

<button on:click={() => scene.flick()}>Flick</button>

{#each { length: 2 } as i}
	<div>
		<Canvas>
			<World>
				<Debug />

				<Scene bind:this={scene} />
				<HTML slot="fallback" transform>
					<p>This browser is not supported.</p>
				</HTML>
			</World>
		</Canvas>
	</div>
{/each}

<style>
	div {
		width: 800px;
		aspect-ratio: 1;
		margin: 0 auto;
		background: black;
	}
</style>

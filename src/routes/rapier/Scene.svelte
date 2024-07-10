<script>
	import { onMount } from "svelte";
	import { T } from "@threlte/core";
	import { OrbitControls, useGltf } from "@threlte/extras";
	import { AutoColliders, RigidBody } from "@threlte/rapier";
	import {
		Vector3,
		CylinderGeometry,
		BoxGeometry,
		MeshStandardMaterial
	} from "three";

	// import { derived } from 'svelte/store'
	// import type { MeshStandardMaterial, Mesh } from 'three'
	// import { DEG2RAD } from 'three/src/math/MathUtils.js'
	import Ground from "./Ground.svelte";

	const disc = useGltf("../assets/models/disc.gltf");

	const geometry = new BoxGeometry(1, 1, 1);
	const material = new MeshStandardMaterial();

	const w = 0.032;
	const h = 0.009;
	const y = -h / 2 + 0.1;
	const x = 0.3;

	const r = w / 2;
	const segments = 64;
	const mass = 0.006;
	const friction = 0.15;
	const restitution = 0.3;
	const linearDamping = 0;

	let rigidBody;

	// $: geometry =={$disc.nodes.disc.geometry}
	// $: material = $disc.materials;
	export const flick = () => {
		// Calculate the impulse vector
		const impulse = new Vector3(-0.006, 0, 0);

		// Apply the impulse to the disc's center of mass

		rigidBody.applyImpulse(impulse, true);
		// rigidBody.setLinvel({ x: -1, y: 0, z: 0 }, true);
	};
</script>

<T.PerspectiveCamera makeDefault position.x={0.8} position.y={0.2} fov={40}>
	<OrbitControls target.x={0} />
</T.PerspectiveCamera>

<T.DirectionalLight castShadow position={[0, 0.5, 0]} />

<T.Group position={[x, y, 0]} rotation.x={0.0}>
	<RigidBody bind:rigidBody {linearDamping}>
		<AutoColliders shape={"convexHull"} {mass} {friction} {restitution}>
			<T.Mesh
				castShadow
				material={new MeshStandardMaterial({
					color: "red"
				})}
			>
				<T.CylinderGeometry args={[r, r, h, segments]} position={[0, 0, 0]} />
			</T.Mesh>
		</AutoColliders>
	</RigidBody>
</T.Group>

<T.GridHelper args={[1]} />

<Ground />

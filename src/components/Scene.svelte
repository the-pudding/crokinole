<script>
	import { T, useTask } from "@threlte/core";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
	import { interactivity, GLTF } from "@threlte/extras";
	import { spring } from "svelte/motion";
	import { useLoader } from "@threlte/core";
	import * as Three from "three";

	const gltf = useLoader(GLTFLoader).load("assets/models/disc.gltf");

	const gridHelper = new Three.GridHelper(20, 20);
	const axesHelper = new Three.AxesHelper(10);

	interactivity();
	const scale = spring(1);
	let rotation = 0;
	useTask((delta) => {
		rotation += delta;
	});
</script>

<!-- <T.Object3DInstance object={gridHelper} />
<T.Object3DInstance object={axesHelper} /> -->

<T.PerspectiveCamera
	makeDefault
	position={[0, 100, 200]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
/>

<T.DirectionalLight position={[0, 50, 20]} castShadow />
<!-- 
<T.Mesh
	rotation.y={rotation}
	position.y={0}
	scale={$scale}
	on:pointerenter={() => scale.set(1.5)}
	on:pointerleave={() => scale.set(1)}
	castShadow
>
	<T.BoxGeometry args={[1, 2, 1]} />
	<T.MeshStandardMaterial color="hotpink" />
</T.Mesh> -->

<T.Mesh position.y={0} rotation.x={-Math.PI / 2} receiveShadow>
	<T.CircleGeometry args={[50, 200, 10]} />
	<T.MeshStandardMaterial color="white" />
</T.Mesh>

<GLTF url="assets/models/disc.gltf" castShadow />

<script>
	import { T } from "@threlte/core";
	import { AutoColliders } from "@threlte/rapier";
	import { CircleGeometry, MeshStandardMaterial } from "three";

	const w = 10;
	const h = 1;
	const y = -h / 2;
</script>

<T.Group position={[0, y, 0]} rotation.x={-Math.PI / 2}>
	<AutoColliders shape={"cuboid"}>
		<T.Mesh receiveShadow material={new MeshStandardMaterial()}
			><T.CircleGeometry args={[w, w, 20]} />
		</T.Mesh>
	</AutoColliders>
</T.Group>

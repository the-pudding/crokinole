<script>
	import { T } from "@threlte/core";
	import { OrbitControls, Environment } from "@threlte/extras";
	import { AutoColliders, CollisionGroups, RigidBody } from "@threlte/rapier";
	import { BoxGeometry, MeshStandardMaterial } from "three";
	import Ground from "./Ground.svelte";

	const geometry = new BoxGeometry(1, 1, 1);

	let resetCounter = 0;
	export const reset = () => {
		resetCounter += 1;
	};
</script>

<T.PerspectiveCamera makeDefault position.x={42} position.y={13} fov={40}>
	<OrbitControls target.x={2.5} />
</T.PerspectiveCamera>

<T.DirectionalLight castShadow position={[8, 20, -3]} />

{#key resetCounter}
	<!-- Collider A -->
	<T.Group position={[0, 30, 1 - Math.random() * 2]}>
		<RigidBody>
			<AutoColliders shape={"cuboid"}>
				<T.Mesh
					castShadow
					{geometry}
					material={new MeshStandardMaterial({
						color: "red"
					})}
				/>
			</AutoColliders>
		</RigidBody>
	</T.Group>

	<!-- Collider B -->
	<T.Group position={[0, 20, 1 - Math.random() * 2]}>
		<RigidBody>
			<AutoColliders shape={"cuboid"}>
				<T.Mesh
					castShadow
					{geometry}
					material={new MeshStandardMaterial({
						color: "green"
					})}
				/>
			</AutoColliders>
		</RigidBody>
	</T.Group>

	<!-- Collider C -->
	<T.Group position={[0, 15, 1 - Math.random() * 2]}>
		<RigidBody>
			<AutoColliders shape={"cuboid"}>
				<T.Mesh
					castShadow
					{geometry}
					material={new MeshStandardMaterial({
						color: "blue"
					})}
				/>
			</AutoColliders>
		</RigidBody>
	</T.Group>
{/key}

<T.GridHelper args={[50]} />

<Ground />

<script>
	import { T } from "@threlte/core";
	import { AutoColliders } from "@threlte/rapier";
	import {
		Mesh,
		CylinderGeometry,
		MeshStandardMaterial,
		Vector3,
		Quaternion,
		Matrix4
	} from "three";
	import { CSG } from "three-csg-ts";

	const w = 0.6604;
	const h = 0.0127;
	const y = -h / 2;

	const r = w / 2;
	const innerR = r / 14; // Adjust this value to control the size of the inner hole
	const segments = 128;

	const mass = 10;
	const friction = 0.1;
	const restitution = 0.3;
	const linearDamping = 0;

	let material = new MeshStandardMaterial();

	// Create outer cylinder geometry
	const outerGeometry = new CylinderGeometry(r, r, h, segments);

	// Create inner cylinder geometry (the hole)
	const innerGeometry = new CylinderGeometry(innerR, innerR, h, segments);

	// Position the inner cylinder geometry to match the outer one
	innerGeometry.translate(0, 0, 0);

	// Perform the CSG subtraction
	const outerMesh = new Mesh(outerGeometry, material);
	const innerMesh = new Mesh(innerGeometry, material);
	const subtractedMesh = CSG.subtract(outerMesh, innerMesh);
</script>

<T.Group position={[0, y, 0]}>
	<AutoColliders {mass} {friction} {restitution}>
		<T.Mesh receiveShadow geometry={subtractedMesh.geometry} {material} />
	</AutoColliders>
</T.Group>

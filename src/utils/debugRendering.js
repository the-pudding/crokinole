import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";

export function createDebugColliders(world, scene) {
	const debugMeshes = [];

	// Function to create a wireframe mesh from a collider
	function createDebugMesh(collider) {
		let geometry;
		const position = collider.translation();
		const rotation = collider.rotation();

		if (collider.shape instanceof RAPIER.Ball) {
			geometry = new THREE.SphereGeometry(collider.shape.radius, 32, 32);
		} else if (collider.shape instanceof RAPIER.Cylinder) {
			geometry = new THREE.CylinderGeometry(
				collider.shape.radius,
				collider.shape.radius,
				collider.shape.halfHeight * 2,
				32
			);
		} else if (collider.shape instanceof RAPIER.TriMesh) {
			geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				"position",
				new THREE.Float32BufferAttribute(collider.shape.vertices, 3)
			);
			geometry.setIndex(
				new THREE.Uint32BufferAttribute(collider.shape.indices, 1)
			);
		} else {
			console.log("Unsupported collider shape:", collider.shape);
			return null;
		}

		const material = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			wireframe: true
		});
		const mesh = new THREE.Mesh(geometry, material);

		mesh.position.set(position.x, position.y, position.z);
		mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

		scene.add(mesh);
		debugMeshes.push(mesh);

		return mesh;
	}

	// Create debug meshes for all colliders in the world
	world.forEachCollider((collider) => {
		createDebugMesh(collider);
	});

	// Function to update debug meshes
	function updateDebugMeshes() {
		world.forEachCollider((collider, i) => {
			if (debugMeshes[i]) {
				const position = collider.translation();
				const rotation = collider.rotation();
				debugMeshes[i].position.set(position.x, position.y, position.z);
				debugMeshes[i].quaternion.set(
					rotation.x,
					rotation.y,
					rotation.z,
					rotation.w
				);
			}
		});
	}

	return {
		updateDebugMeshes,
		debugMeshes
	};
}

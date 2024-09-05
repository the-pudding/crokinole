import R from "@dimforge/rapier3d-compat";

// function extractVerticesFromGeometry(geometry) {
// 	const vertices = [];
// 	const positionAttribute = geometry.attributes.position;

// 	for (let i = 0; i < positionAttribute.count; i++) {
// 		const x = positionAttribute.getX(i);
// 		const y = positionAttribute.getY(i);
// 		const z = positionAttribute.getZ(i);
// 		vertices.push(x, y, z);
// 	}

// 	return new Float32Array(vertices);
// }

function convertThreeMeshToMeshObject(mesh) {
	const positions = mesh.geometry.attributes.position.array;
	const vertices = [];
	for (let i = 0; i < positions.length; i += 3) {
		vertices.push(positions[i], positions[i + 1], positions[i + 2]);
	}

	let indices = [];
	if (mesh.geometry.index) {
		indices = Array.from(mesh.geometry.index.array);
	} else if (mesh.geometry.attributes.index) {
		indices = Array.from(mesh.geometry.attributes.index.array);
	} else if (mesh.geometry.index === null) {
		for (let i = 0; i < vertices.length; i++) {
			indices.push(i);
		}
	}

	return {
		vertices: new Float32Array(vertices),
		indices: new Uint32Array(indices)
	};
	// return new Mesh(vertices, indices);
}

function extractVerticesIndicesFromGeometry(geometry) {
	const vertices = [];
	const indices = [];
	const positionAttribute = geometry.attributes.position;
	const indexAttribute = geometry.index;

	for (let i = 0; i < positionAttribute.count; i++) {
		vertices.push(positionAttribute.getX(i));
		vertices.push(positionAttribute.getY(i));
		vertices.push(positionAttribute.getZ(i));
	}

	if (indexAttribute) {
		for (let i = 0; i < indexAttribute.count; i++) {
			indices.push(indexAttribute.getX(i));
			indices.push(indexAttribute.getY(i));
			indices.push(indexAttribute.getZ(i));
		}
	}
	return {
		vertices: new Float32Array(vertices),
		indices: new Uint32Array(indices)
	};
}

export default function createHollowCylinderCollider(mesh) {
	// const { vertices, indices} = extractVerticesIndicesFromGeometry(mesh.geometry);

	// Create the convex hull collider
	// const colliderDesc = R.ColliderDesc.convexHull(vertices);
	// return colliderDesc;

	const { vertices, indices } = convertThreeMeshToMeshObject(mesh);
	// https://rapier.rs/javascript3d/enums/TriMeshFlags.html
	const colliderDesc = R.ColliderDesc.trimesh(
		vertices,
		indices,
		R.TriMeshFlags.FIX_INTERNAL_EDGES
	);
	return colliderDesc;
}

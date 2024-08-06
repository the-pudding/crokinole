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

export default function createHollowCylinderCollider(geometry) {
	// const vertices = extractVerticesFromGeometry(geometry);

	// Create the convex hull collider
	// const colliderDesc = R.ColliderDesc.convexHull(vertices);
	// return colliderDesc;
	const { vertices, indices } = extractVerticesIndicesFromGeometry(geometry);
	const colliderDesc = R.ColliderDesc.trimesh(vertices, indices);
	return colliderDesc;
}
